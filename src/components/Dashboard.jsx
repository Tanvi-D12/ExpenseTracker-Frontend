import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

const Dashboard = ({ expenses = [] }) => {
  const [chartData, setChartData] = useState({
    monthlyData: [],
    categoryData: [],
    spendingTrend: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Calculate real data from expenses
  useEffect(() => {
    // Calculate category data from actual expenses - ALL CATEGORIES START AT 0
    const categoryTotals = {
      food: 0,
      shopping: 0,
      transportation: 0,
      entertainment: 0,
      utilities: 0,
      other: 0
    };

    // Only add amounts if expenses exist
    expenses.forEach(expense => {
      const category = expense.category || 'other';
      if (categoryTotals.hasOwnProperty(category)) {
        categoryTotals[category] += parseFloat(expense.amount || 0);
      }
    });

    const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    // ALL CATEGORIES START WITH 0 AMOUNT - only show real data when expenses exist
    const categoryData = [
      { name: 'Food & Dining', value: 0, amount: 0, color: '#a78bfa', realValue: categoryTotals.food },
      { name: 'Shopping', value: 0, amount: 0, color: '#c084fc', realValue: categoryTotals.shopping },
      { name: 'Transportation', value: 0, amount: 0, color: '#e879f9', realValue: categoryTotals.transportation },
      { name: 'Entertainment', value: 0, amount: 0, color: '#f472b6', realValue: categoryTotals.entertainment },
      { name: 'Utilities', value: 0, amount: 0, color: '#fb7185', realValue: categoryTotals.utilities },
      { name: 'Other', value: 0, amount: 0, color: '#d8b4fe', realValue: categoryTotals.other }
    ].map(cat => ({
      ...cat,
      // Only calculate percentages if there are actual expenses
      value: totalSpent > 0 ? Math.round((cat.realValue / totalSpent) * 100) : 0,
      // Use real expense data, fallback to 0
      amount: cat.realValue || 0
    }));

    const monthlyData = [
      { month: 'Jan', amount: 0 },
      { month: 'Feb', amount: 0 },
      { month: 'Mar', amount: 0 },
      { month: 'Apr', amount: 0 },
      { month: 'May', amount: 0 },
      { month: 'Jun', amount: 0 }
    ];

    const spendingTrend = [
      { week: 'Week 1', spent: 0, budget: 5000 },
      { week: 'Week 2', spent: 0, budget: 5000 },
      { week: 'Week 3', spent: 0, budget: 5000 },
      { week: 'Week 4', spent: 0, budget: 5000 }
    ];

    // Simulate loading
    setTimeout(() => {
      setChartData({ monthlyData, categoryData, spendingTrend });
      setIsLoading(false);
    }, 1000);
  }, [expenses]);

  // Calculate real statistics - ALL START AT 0
  const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0) || 0;
  const monthlySpent = 0; // Start at 0
  const transactionCount = expenses.length || 0;
  const avgMonthly = 0; // Start at 0

  const StatsCard = ({ icon, title, value, subtitle, loading }) => (
    <div className={`stat-card ${loading ? 'pulse-card' : ''}`}>
      <div className="stat-icon">{icon}</div>
      {loading ? (
        <div className="skeleton-loader skeleton-line" style={{ height: '2.5rem', marginBottom: '0.5rem' }}></div>
      ) : (
        <div className="stat-value">{value}</div>
      )}
      <div className="stat-label">{title}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      {/* Remove the +12% since it doesn't make sense when starting at 0 */}
    </div>
  );

  const SkeletonChart = () => (
    <div className="chart-card skeleton-card">
      <div className="skeleton-loader skeleton-line" style={{ height: '1.5rem', marginBottom: '1rem', width: '60%' }}></div>
      <div className="skeleton-loader skeleton-line" style={{ height: '200px', marginBottom: '0.5rem' }}></div>
      <div className="skeleton-loader skeleton-line" style={{ height: '1rem', width: '80%' }}></div>
    </div>
  );

  const getCategoryEmoji = (category) => {
    const emojis = {
      food: '🍔',
      grocery: '🛒',
      transportation: '🚗',
      shopping: '🛍️',
      entertainment: '🎬',
      utilities: '💡',
      health: '🏥',
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
      other: 'Other'
    };
    return labels[category] || 'Other';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">💰 Expense Dashboard</h1>
          <p className="dashboard-subtitle">Track and analyze your spending patterns</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <StatsCard 
          icon="💰" 
          title="Total Spent" 
          value={formatCurrency(totalSpent)} 
          subtitle="All time"
          loading={isLoading}
        />
        <StatsCard 
          icon="📈" 
          title="This Month" 
          value={formatCurrency(monthlySpent)} 
          subtitle="Current month"
          loading={isLoading}
        />
        <StatsCard 
          icon="📋" 
          title="Transactions" 
          value={transactionCount} 
          subtitle="Total records"
          loading={isLoading}
        />
        <StatsCard 
          icon="🛒" 
          title="Avg. Monthly" 
          value={formatCurrency(avgMonthly)} 
          subtitle="Monthly average"
          loading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Spending by Category - Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">📊 Spending by Category</h3>
            <p className="chart-subtitle">Where your money goes</p>
          </div>
          {isLoading ? (
            <SkeletonChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}%`, 
                    'Percentage'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {!isLoading && (
            <div className="category-legend">
              {chartData.categoryData.map((category, index) => (
                <div key={index} className="legend-item">
                  <div 
                    className="color-dot" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span>{category.name}</span>
                  <span className="amount">{formatCurrency(category.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Spending - Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">📈 Monthly Overview</h3>
            <p className="chart-subtitle">Last 6 months spending</p>
          </div>
          {isLoading ? (
            <SkeletonChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(102,126,234,0.5)',
                    borderRadius: '10px'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  name="Monthly Spending" 
                  fill="#a78bfa" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Spending Trend - Area Chart */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3 className="chart-title">📅 Spending vs Budget</h3>
            <p className="chart-subtitle">Weekly spending comparison</p>
          </div>
          {isLoading ? (
            <SkeletonChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(102,126,234,0.5)',
                    borderRadius: '10px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="spent" 
                  stackId="1" 
                  stroke="#a78bfa" 
                  fill="#a78bfa" 
                  name="Amount Spent"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="budget" 
                  stackId="1" 
                  stroke="#c084fc" 
                  fill="#c084fc" 
                  name="Monthly Budget"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">🕒 Recent Transactions</h3>
            <p className="chart-subtitle">Latest 5 expenses</p>
          </div>
          <div className="transactions-list">
            {isLoading ? (
              // Skeleton for transactions
              [...Array(5)].map((_, index) => (
                <div key={index} className="transaction-item skeleton-item">
                  <div className="skeleton-loader" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-loader skeleton-line" style={{ height: '16px', marginBottom: '8px', width: '70%' }}></div>
                    <div className="skeleton-loader skeleton-line" style={{ height: '12px', width: '50%' }}></div>
                  </div>
                  <div className="skeleton-loader skeleton-line" style={{ height: '20px', width: '60px' }}></div>
                </div>
              ))
            ) : expenses.length > 0 ? (
              expenses.slice(0, 5).map((expense, index) => (
                <div key={index} className="transaction-item">
                  <div className="transaction-icon">
                    {getCategoryEmoji(expense.category)}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-merchant">{expense.merchant}</div>
                    <div className="transaction-category">{expense.category}</div>
                  </div>
                  <div className="transaction-amount">{formatCurrency(expense.amount)}</div>
                </div>
              ))
            ) : (
              <div className="no-transactions">
                <div className="no-transactions-icon">📝</div>
                <p>No transactions yet</p>
                <p className="no-transactions-subtitle">Scan your first receipt to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Expenses Section - ADDED THIS SECTION */}
      {expenses.length > 0 && (
        <div className="expenses-section">
          <div className="section-header">
            <h3 className="section-title">📋 All Expenses</h3>
            <p className="section-subtitle">Complete list of your expenses</p>
          </div>
          <div className="expenses-list">
            {expenses.map((expense, index) => (
              <div key={index} className="expense-item">
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
    </div>
  );
};

export default Dashboard;