import React from 'react';

const Analytics = ({ data }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      food: '🍔',
      grocery: '🛒',
      transportation: '🚗',
      shopping: '🛍️',
      entertainment: '🎬',
      utilities: '💡',
      health: '🏥',
      education: '📚',
      travel: '✈️',
      other: '📦'
    };
    return emojis[category] || '📦';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      food: 'Food & Dining',
      grocery: 'Groceries',
      transportation: 'Transportation',
      shopping: 'Shopping',
      entertainment: 'Entertainment',
      utilities: 'Utilities',
      health: 'Health & Medical',
      education: 'Education',
      travel: 'Travel',
      other: 'Other'
    };
    return labels[category] || 'Other';
  };

  if (!data) {
    return (
      <div className="analytics-loading">
        <div className="loading-state">
          <div className="spinner"></div>
          <h3>Loading Analytics...</h3>
          <p>Crunching the numbers for you</p>
        </div>
      </div>
    );
  }

  const { totalSpent, totalExpenses, byCategory, monthly, recentExpenses } = data;

  // Calculate percentage for each category
  const categoriesWithPercentages = byCategory.map(category => ({
    ...category,
    percentage: totalSpent > 0 ? (category.amount / totalSpent) * 100 : 0
  }));

  // Get current month and previous month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthData = monthly.find(m => m.month === currentMonth);
  const currentMonthSpent = currentMonthData ? currentMonthData.amount : 0;

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>📊 Spending Analytics</h2>
        <p>Understand your spending patterns and trends</p>
      </div>

      {/* Summary Cards */}
      <div className="analytics-grid">
        <div className="analytics-card total-spent">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Spent</h3>
            <div className="value">{formatCurrency(totalSpent)}</div>
            <div className="label">{totalExpenses} expenses</div>
          </div>
        </div>

        <div className="analytics-card monthly-spent">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>This Month</h3>
            <div className="value">{formatCurrency(currentMonthSpent)}</div>
            <div className="label">Current month spending</div>
          </div>
        </div>

        <div className="analytics-card avg-spent">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Average/Expense</h3>
            <div className="value">
              {formatCurrency(totalExpenses > 0 ? totalSpent / totalExpenses : 0)}
            </div>
            <div className="label">Per expense</div>
          </div>
        </div>

        <div className="analytics-card categories-count">
          <div className="card-icon">🏷️</div>
          <div className="card-content">
            <h3>Categories</h3>
            <div className="value">{byCategory.length}</div>
            <div className="label">Spending categories</div>
          </div>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="analytics-section">
        <h3>📋 Spending by Category</h3>
        <div className="category-list">
          {categoriesWithPercentages.map((category) => (
            <div key={category.category} className="category-item">
              <div className="category-info">
                <span className="category-emoji">
                  {getCategoryEmoji(category.category)}
                </span>
                <span className="category-name">
                  {getCategoryLabel(category.category)}
                </span>
              </div>
              <div className="category-stats">
                <div className="category-amount">{formatCurrency(category.amount)}</div>
                <div className="category-percentage">
                  {category.percentage.toFixed(1)}%
                </div>
                <div className="category-count">({category.count} expenses)</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Expenses List */}
      {recentExpenses && recentExpenses.length > 0 && (
        <div className="analytics-section">
          <h3>📋 All Expenses</h3>
          <div className="expenses-list">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-main">
                  <span className="expense-emoji">
                    {getCategoryEmoji(expense.category)}
                  </span>
                  <div className="expense-details">
                    <div className="expense-merchant">{expense.merchant}</div>
                    <div className="expense-description">{expense.description}</div>
                    <div className="expense-meta">
                      <span className="expense-category">
                        {getCategoryLabel(expense.category)}
                      </span>
                      <span className="expense-date">
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="expense-amount">{formatCurrency(expense.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .analytics {
          space-y: 30px;
        }
        
        .analytics-loading {
          text-align: center;
          padding: 60px 20px;
        }
        
        .loading-state h3 {
          color: #4a5568;
          margin: 20px 0 10px;
        }
        
        .loading-state p {
          color: #718096;
        }
        
        .analytics-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .analytics-header h2 {
          color: #2d3748;
          margin-bottom: 8px;
        }
        
        .analytics-header p {
          color: #718096;
          font-size: 1.1rem;
        }
        
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .analytics-card {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 25px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .card-icon {
          font-size: 2.5rem;
          opacity: 0.9;
        }
        
        .card-content h3 {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .card-content .value {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 2px;
        }
        
        .card-content .label {
          font-size: 0.85rem;
          opacity: 0.8;
        }
        
        .analytics-section {
          background: #f7fafc;
          padding: 25px;
          border-radius: 15px;
          border: 2px solid #e2e8f0;
        }
        
        .analytics-section h3 {
          color: #2d3748;
          margin-bottom: 20px;
          font-size: 1.3rem;
        }
        
        .category-list {
          space-y: 12px;
        }
        
        .category-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        
        .category-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .category-emoji {
          font-size: 1.5rem;
        }
        
        .category-name {
          font-weight: 600;
          color: #2d3748;
        }
        
        .category-stats {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .category-amount {
          font-weight: 700;
          color: #2d3748;
        }
        
        .category-percentage {
          background: #edf2f7;
          color: #4a5568;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        
        .category-count {
          color: #a0aec0;
          font-size: 0.85rem;
        }
        
        .expenses-list {
          space-y: 15px;
        }
        
        .expense-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        
        .expense-item:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .expense-main {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }
        
        .expense-emoji {
          font-size: 1.8rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7fafc;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }
        
        .expense-details {
          flex: 1;
        }
        
        .expense-merchant {
          font-weight: 600;
          color: #2d3748;
          font-size: 1.1rem;
          margin-bottom: 4px;
        }
        
        .expense-description {
          color: #718096;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }
        
        .expense-meta {
          display: flex;
          gap: 15px;
          font-size: 0.85rem;
        }
        
        .expense-category {
          background: #edf2f7;
          color: #4a5568;
          padding: 4px 8px;
          border-radius: 6px;
        }
        
        .expense-date {
          color: #a0aec0;
        }
        
        .expense-amount {
          font-weight: 700;
          font-size: 1.2rem;
          color: #2d3748;
        }
        
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 2s linear infinite;
          margin: 0 auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Analytics;