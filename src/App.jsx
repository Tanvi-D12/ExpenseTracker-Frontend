import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import './App.css';

// API base URL - points to your backend
const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'food',
    merchant: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Load real expenses from backend
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/expenses`);
      const data = await response.json();
      if (data.success) {
        setExpenses(data.data || []);
        showToast('Expenses loaded successfully!');
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
      // Fallback to sample data if backend not reachable
      setExpenses([
        { 
          id: 1, 
          amount: 45.50, 
          merchant: 'Starbucks', 
          category: 'food', 
          date: '2024-09-30', 
          description: 'Coffee and snacks' 
        },
        { 
          id: 2, 
          amount: 120.00, 
          merchant: 'Amazon', 
          category: 'shopping', 
          date: '2024-09-29', 
          description: 'Online shopping' 
        }
      ]);
      showToast('Using sample data - backend not connected', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setScanning(true);
    setPreviewUrl(URL.createObjectURL(file));
    setExtractedData(null);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch(`${API_BASE_URL}/ocr/scan-receipt`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setExtractedData(result.data);
        
        // Auto-fill form with REAL extracted data
        setFormData(prev => ({
          ...prev,
          amount: result.data.amount || '',
          merchant: result.data.merchant || '',
          category: result.data.category || 'other',
          description: result.data.merchant ? `Receipt from ${result.data.merchant}` : 'Scanned receipt',
          date: result.data.date || prev.date
        }));

        showToast('✅ Receipt scanned successfully! Check the extracted data.');
      } else {
        showToast('❌ Scan failed: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Scan error:', error);
      showToast('❌ Scan failed. Make sure backend is running on http://localhost:5000', 'error');
      
      // Fallback: Show sample extracted data
      const mockData = {
        amount: 45.50,
        merchant: 'Starbucks',
        category: 'food',
        date: new Date().toISOString().split('T')[0],
        confidence: '92%'
      };
      setExtractedData(mockData);
      setFormData(prev => ({
        ...prev,
        amount: mockData.amount,
        merchant: mockData.merchant,
        category: mockData.category,
        description: `Receipt from ${mockData.merchant}`,
        date: mockData.date
      }));
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.merchant) {
      showToast('Please fill in amount and merchant fields', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Add new expense to the list
        setExpenses(prev => [result.data, ...prev]);
        
        // Reset form
        setFormData({
          amount: '',
          description: '',
          category: 'food',
          merchant: '',
          date: new Date().toISOString().split('T')[0]
        });
        setExtractedData(null);
        setPreviewUrl('');
        
        showToast('✅ Expense added successfully!');
      } else {
        showToast('❌ Failed to save expense: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('❌ Failed to save expense. Check backend connection.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const deleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
        showToast('✅ Expense deleted successfully!');
      } else {
        showToast('❌ Failed to delete expense: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('❌ Failed to delete expense.', 'error');
    }
  };

  const categoryOptions = [
    { value: 'food', label: '🍔 Food & Dining', color: '#48bb78' },
    { value: 'grocery', label: '🛒 Groceries', color: '#ed8936' },
    { value: 'transportation', label: '🚗 Transportation', color: '#4299e1' },
    { value: 'shopping', label: '🛍️ Shopping', color: '#9f7aea' },
    { value: 'entertainment', label: '🎬 Entertainment', color: '#ed64a6' },
    { value: 'utilities', label: '💡 Utilities', color: '#667eea' },
    { value: 'health', label: '🏥 Health', color: '#f56565' },
    { value: 'other', label: '📦 Other', color: '#a0aec0' }
  ];

  const getCategoryEmoji = (category) => {
    return categoryOptions.find(cat => cat.value === category)?.label.split(' ')[0] || '📦';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Calculate real analytics from actual expenses
  const analyticsData = {
    totalSpent: expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
    totalExpenses: expenses.length,
    byCategory: Object.values(expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = { category, amount: 0, count: 0 };
      }
      acc[category].amount += parseFloat(expense.amount);
      acc[category].count += 1;
      return acc;
    }, {})).sort((a, b) => b.amount - a.amount)
  };

  // Skeleton loader for expenses
  const ExpenseSkeleton = () => (
    <div className="expense-card skeleton-card">
      <div className="expense-main">
        <div className="expense-emoji skeleton-loader" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
        <div className="expense-details" style={{ flex: 1 }}>
          <div className="skeleton-loader skeleton-line" style={{ height: '16px', marginBottom: '8px', width: '60%' }}></div>
          <div className="skeleton-loader skeleton-line" style={{ height: '12px', marginBottom: '8px', width: '80%' }}></div>
          <div className="skeleton-loader skeleton-line" style={{ height: '12px', width: '40%' }}></div>
        </div>
      </div>
      <div className="expense-actions">
        <div className="skeleton-loader skeleton-line" style={{ height: '20px', width: '80px' }}></div>
      </div>
    </div>
  );

  return (
    <div className="app">
      {/* Toast Notifications */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="app-header fade-in">
        <div className="header-content">
          <h1>💰 Smart Expense Tracker</h1>
          <p>AI-powered receipt scanning & expense management</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{formatCurrency(analyticsData.totalSpent)}</span>
            <span className="stat-label">Total Spent</span>
          </div>
          <div className="stat">
            <span className="stat-value">{analyticsData.totalExpenses}</span>
            <span className="stat-label">Expenses</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tabs-nav fade-in">
        {[
          { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
          { id: 'scanner', label: '📸 Scan Receipt', icon: '📸' },
          { id: 'manual', label: '✏️ Add Manual', icon: '✏️' },
          { id: 'expenses', label: '📋 Expenses', icon: '📋' },
          { id: 'analytics', label: '📈 Analytics', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <Dashboard expenses={expenses} />
        )}

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="scanner-container fade-in">
            <div className="scanner-section">
              <h2>📸 Smart Receipt Scanner</h2>
              <p className="section-description">Upload a receipt and watch AI extract details automatically!</p>
              
              <div className="upload-card">
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={scanning}
                />
                <label htmlFor="receipt-upload" className={`upload-area ${scanning ? 'scanning' : ''}`}>
                  {scanning ? (
                    <div className="scanning-animation">
                      <div className="scanner-beam"></div>
                      <span>🔍 AI Scanning Receipt...</span>
                    </div>
                  ) : (
                    <>
                      <div className="upload-icon">📁</div>
                      <span className="upload-text">Choose Receipt Image</span>
                      <span className="upload-hint">Supports: JPG, PNG, GIF, BMP</span>
                    </>
                  )}
                </label>

                {previewUrl && (
                  <div className="image-preview fade-in">
                    <img src={previewUrl} alt="Receipt preview" />
                  </div>
                )}
              </div>

              {extractedData && (
                <div className="extracted-data-card fade-in">
                  <h3>✅ Data Extracted Successfully!</h3>
                  <div className="data-grid">
                    <div className="data-item">
                      <span className="data-label">Amount:</span>
                      <span className="data-value">{formatCurrency(extractedData.amount)}</span>
                    </div>
                    <div className="data-item">
                      <span className="data-label">Merchant:</span>
                      <span className="data-value">{extractedData.merchant}</span>
                    </div>
                    <div className="data-item">
                      <span className="data-label">Category:</span>
                      <span className="data-value">
                        {categoryOptions.find(cat => cat.value === extractedData.category)?.label}
                      </span>
                    </div>
                    <div className="data-item">
                      <span className="data-label">Date:</span>
                      <span className="data-value">{extractedData.date}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-section fade-in">
              <h3>✏️ Confirm & Save</h3>
              <form onSubmit={handleSubmit} className="expense-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="0.00"
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                      disabled={isSaving}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Merchant</label>
                  <input
                    type="text"
                    value={formData.merchant}
                    onChange={(e) => handleInputChange('merchant', e.target.value)}
                    placeholder="Where did you spend?"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="What was this for?"
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    disabled={isSaving}
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className={`submit-btn ${isSaving ? 'btn-loading' : ''}`}
                  disabled={isSaving || !formData.amount || !formData.merchant}
                >
                  {isSaving ? 'Saving...' : '💾 Save Expense'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <div className="manual-entry fade-in">
            <h2>✏️ Add Expense Manually</h2>
            <p>Enter your expense details below</p>
            
            <form onSubmit={handleSubmit} className="expense-form full-width">
              <div className="form-grid">
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    required
                    disabled={isSaving}
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Merchant</label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => handleInputChange('merchant', e.target.value)}
                  placeholder="Where did you spend?"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="What was this for?"
                  disabled={isSaving}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  disabled={isSaving}
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className={`submit-btn ${isSaving ? 'btn-loading' : ''}`}
                disabled={isSaving || !formData.amount || !formData.merchant}
              >
                {isSaving ? 'Saving...' : '💾 Save Expense'}
              </button>
            </form>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="expenses-tab fade-in">
            <div className="section-header">
              <h2>📋 Expense History</h2>
              <div className="expenses-summary">
                <span>{expenses.length} expenses</span>
                <span>•</span>
                <span>{formatCurrency(expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0))} total</span>
              </div>
            </div>

            <div className="expenses-list">
              {isLoading ? (
                // Show skeleton loaders while loading
                <>
                  <ExpenseSkeleton />
                  <ExpenseSkeleton />
                  <ExpenseSkeleton />
                </>
              ) : expenses.length > 0 ? (
                expenses.map(expense => (
                  <div key={expense.id} className="expense-card fade-in">
                    <div className="expense-main">
                      <div className="expense-emoji">
                        {getCategoryEmoji(expense.category)}
                      </div>
                      <div className="expense-details">
                        <div className="expense-merchant">{expense.merchant}</div>
                        <div className="expense-description">{expense.description}</div>
                        <div className="expense-meta">
                          <span className="expense-category">
                            {categoryOptions.find(cat => cat.value === expense.category)?.label}
                          </span>
                          <span className="expense-date">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="expense-actions">
                      <div className="expense-amount">
                        {formatCurrency(expense.amount)}
                      </div>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="delete-btn"
                        title="Delete expense"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-expenses">
                  <div className="no-expenses-icon">📝</div>
                  <h3>No expenses yet</h3>
                  <p>Start by scanning a receipt or adding an expense manually</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-tab fade-in">
            <h2>📈 Spending Analytics</h2>
            
            <div className="analytics-grid">
              <div className="metric-card total-spent">
                <div className="metric-icon">💰</div>
                <div className="metric-content">
                  <div className="metric-value">{formatCurrency(analyticsData.totalSpent)}</div>
                  <div className="metric-label">Total Spent</div>
                </div>
              </div>
              
              <div className="metric-card avg-expense">
                <div className="metric-icon">📈</div>
                <div className="metric-content">
                  <div className="metric-value">
                    {formatCurrency(analyticsData.totalExpenses > 0 ? analyticsData.totalSpent / analyticsData.totalExpenses : 0)}
                  </div>
                  <div className="metric-label">Avg/Expense</div>
                </div>
              </div>
              
              <div className="metric-card total-expenses">
                <div className="metric-icon">📋</div>
                <div className="metric-content">
                  <div className="metric-value">{analyticsData.totalExpenses}</div>
                  <div className="metric-label">Total Expenses</div>
                </div>
              </div>
              
              <div className="metric-card categories">
                <div className="metric-icon">🏷️</div>
                <div className="metric-content">
                  <div className="metric-value">{analyticsData.byCategory.length}</div>
                  <div className="metric-label">Categories</div>
                </div>
              </div>
            </div>

            <div className="category-breakdown">
              <h3>Spending by Category</h3>
              <div className="category-list">
                {analyticsData.byCategory.map(category => {
                  const percentage = analyticsData.totalSpent > 0 ? (category.amount / analyticsData.totalSpent) * 100 : 0;
                  const categoryInfo = categoryOptions.find(cat => cat.value === category.category);
                  
                  return (
                    <div key={category.category} className="category-item fade-in">
                      <div className="category-info">
                        <span className="category-emoji">
                          {categoryInfo?.label.split(' ')[0]}
                        </span>
                        <span className="category-name">
                          {categoryInfo?.label.split(' ').slice(1).join(' ')}
                        </span>
                      </div>
                      <div className="category-stats">
                        <div className="category-bar">
                          <div 
                            className="category-progress"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: categoryInfo?.color
                            }}
                          ></div>
                        </div>
                        <div className="category-amount">
                          {formatCurrency(category.amount)}
                          <span className="category-percentage">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;