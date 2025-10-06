import React from 'react';

const ExpenseList = ({ expenses, onDeleteExpense, onRefresh }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  if (expenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Expenses Yet</h3>
          <p>Start by adding an expense using the scanner or manual form.</p>
          <button onClick={onRefresh} className="refresh-button">
            🔄 Refresh
          </button>
        </div>
      </div>
    );
  }

  // Calculate total spent
  const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  return (
    <div className="expense-list">
      <div className="expense-list-header">
        <div className="header-info">
          <h2>📋 All Expenses</h2>
          <p className="expense-count">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} • {formatCurrency(totalSpent)} total
          </p>
        </div>
        <button onClick={onRefresh} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      <div className="expenses-container">
        {expenses.map((expense) => (
          <div key={expense.id} className="expense-item">
            <div className="expense-main">
              <div className="expense-emoji">
                {getCategoryEmoji(expense.category)}
              </div>
              
              <div className="expense-info">
                <div className="expense-merchant">{expense.merchant}</div>
                <div className="expense-description">{expense.description}</div>
                <div className="expense-meta">
                  <span className="expense-category">
                    {getCategoryLabel(expense.category)}
                  </span>
                  <span className="expense-date">{formatDate(expense.date)}</span>
                </div>
              </div>
            </div>

            <div className="expense-actions">
              <div className="expense-amount">{formatCurrency(expense.amount)}</div>
              <button
                onClick={() => onDeleteExpense(expense.id)}
                className="delete-button"
                title="Delete expense"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .expense-list {
          background: white;
        }
        
        .expense-list-empty {
          text-align: center;
          padding: 60px 20px;
        }
        
        .empty-state {
          max-width: 400px;
          margin: 0 auto;
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.5;
        }
        
        .empty-state h3 {
          color: #4a5568;
          margin-bottom: 10px;
        }
        
        .empty-state p {
          color: #718096;
          margin-bottom: 20px;
        }
        
        .expense-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f7fafc;
        }
        
        .header-info h2 {
          color: #2d3748;
          margin-bottom: 5px;
        }
        
        .expense-count {
          color: #718096;
          font-size: 0.95rem;
        }
        
        .refresh-button {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .refresh-button:hover {
          background: #5a6fd8;
          transform: translateY(-1px);
        }
        
        .expenses-container {
          space-y: 15px;
        }
        
        .expense-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #f7fafc;
          border-radius: 12px;
          margin-bottom: 15px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .expense-item:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .expense-main {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }
        
        .expense-emoji {
          font-size: 1.8rem;
          background: white;
          padding: 10px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .expense-info {
          flex: 1;
        }
        
        .expense-merchant {
          font-weight: 600;
          font-size: 1.1rem;
          color: #2d3748;
          margin-bottom: 4px;
        }
        
        .expense-description {
          color: #718096;
          margin-bottom: 8px;
          font-size: 0.95rem;
        }
        
        .expense-meta {
          display: flex;
          gap: 15px;
          font-size: 0.85rem;
        }
        
        .expense-category {
          background: #e2e8f0;
          padding: 4px 8px;
          border-radius: 12px;
          color: #4a5568;
          font-weight: 500;
        }
        
        .expense-date {
          color: #a0aec0;
        }
        
        .expense-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .expense-amount {
          font-size: 1.3rem;
          font-weight: 700;
          color: #e53e3e;
        }
        
        .delete-button {
          background: #fed7d7;
          color: #c53030;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }
        
        .delete-button:hover {
          background: #feb2b2;
          transform: scale(1.1);
        }
        
        @media (max-width: 768px) {
          .expense-list-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
          
          .expense-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .expense-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .expense-main {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ExpenseList;