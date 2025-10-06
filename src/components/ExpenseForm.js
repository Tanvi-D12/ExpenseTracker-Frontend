import React, { useState } from 'react';

const ExpenseForm = ({ onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'other',
    merchant: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.merchant || !formData.date) {
      alert('Please fill in all required fields: Amount, Merchant, and Date');
      return;
    }

    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    setSubmitting(true);

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      description: formData.description || `Expense at ${formData.merchant}`
    };

    const success = await onExpenseAdded(expenseData);
    
    if (success) {
      // Reset form
      setFormData({
        amount: '',
        description: '',
        category: 'other',
        merchant: '',
        date: new Date().toISOString().split('T')[0]
      });
      alert('✅ Expense added successfully!');
    }

    setSubmitting(false);
  };

  const categoryOptions = [
    { value: 'food', label: '🍔 Food & Dining' },
    { value: 'grocery', label: '🛒 Groceries' },
    { value: 'transportation', label: '🚗 Transportation' },
    { value: 'shopping', label: '🛍️ Shopping' },
    { value: 'entertainment', label: '🎬 Entertainment' },
    { value: 'utilities', label: '💡 Utilities' },
    { value: 'health', label: '🏥 Health & Medical' },
    { value: 'education', label: '📚 Education' },
    { value: 'travel', label: '✈️ Travel' },
    { value: 'other', label: '📦 Other' }
  ];

  return (
    <div className="expense-form-container">
      <div className="form-header">
        <h2>✏️ Add Expense Manually</h2>
        <p>Enter your expense details below</p>
      </div>

      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-row">
          <div className="form-group">
            <label>Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Merchant / Store *</label>
          <input
            type="text"
            value={formData.merchant}
            onChange={(e) => handleInputChange('merchant', e.target.value)}
            placeholder="Where did you spend?"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="What did you buy? (optional)"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
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
          className="submit-button"
          disabled={submitting || !formData.amount || !formData.merchant || !formData.date}
        >
          {submitting ? (
            <>
              <div className="spinner-small"></div>
              Adding...
            </>
          ) : (
            '💾 Save Expense'
          )}
        </button>

        {(!formData.amount || !formData.merchant || !formData.date) && (
          <p className="form-warning">
            * Please fill in all required fields
          </p>
        )}
      </form>

      <style jsx>{`
        .expense-form-container {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .form-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .form-header h2 {
          color: #2d3748;
          margin-bottom: 8px;
        }
        
        .form-header p {
          color: #718096;
          font-size: 1rem;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .spinner-small {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }
        
        .form-warning {
          color: #e53e3e;
          font-size: 0.85rem;
          margin-top: 10px;
          text-align: center;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ExpenseForm;