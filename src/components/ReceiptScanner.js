import React, { useState } from 'react';
import { api } from '../services/api';

const ReceiptScanner = ({ onExpenseAdded }) => {
  const [scanning, setScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'other',
    merchant: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setScanning(true);
    setPreviewUrl(URL.createObjectURL(file));
    setExtractedData(null);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await api.post('/ocr/scan-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const data = response.data.data;
        setExtractedData(data);
        
        // Auto-fill form with extracted data
        setFormData(prev => ({
          ...prev,
          amount: data.amount || '',
          merchant: data.merchant || '',
          category: data.category || 'other',
          description: data.merchant ? `Receipt from ${data.merchant}` : 'Scanned receipt',
          date: data.date || prev.date
        }));

        alert('✅ Receipt scanned successfully! Check the extracted data below.');
      }
    } catch (error) {
      console.error('Scan failed:', error);
      alert('❌ Scan failed: ' + error.message);
      setPreviewUrl('');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.merchant) {
      alert('Please fill in at least amount and merchant fields');
      return;
    }

    const success = await onExpenseAdded(formData);
    if (success) {
      // Reset form
      setFormData({
        amount: '',
        description: '',
        category: 'other',
        merchant: '',
        date: new Date().toISOString().split('T')[0]
      });
      setExtractedData(null);
      setPreviewUrl('');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categoryOptions = [
    { value: 'food', label: '🍔 Food & Dining', emoji: '🍔' },
    { value: 'grocery', label: '🛒 Groceries', emoji: '🛒' },
    { value: 'transportation', label: '🚗 Transportation', emoji: '🚗' },
    { value: 'shopping', label: '🛍️ Shopping', emoji: '🛍️' },
    { value: 'entertainment', label: '🎬 Entertainment', emoji: '🎬' },
    { value: 'utilities', label: '💡 Utilities', emoji: '💡' },
    { value: 'other', label: '📦 Other', emoji: '📦' }
  ];

  return (
    <div className="scanner-container">
      <div className="scanner-section">
        <h2>📸 Scan Receipt</h2>
        <p className="section-description">
          Upload a receipt image and let AI extract the details automatically!
        </p>
        
        <div className="upload-area">
          <input
            type="file"
            id="receipt-upload"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={scanning}
          />
          <label htmlFor="receipt-upload" className="upload-button">
            {scanning ? (
              <>
                <div className="spinner-small"></div>
                Scanning...
              </>
            ) : (
              <>
                <span>📁</span>
                Choose Receipt Image
              </>
            )}
          </label>
          
          <p className="upload-hint">
            Supports: JPEG, PNG, GIF, BMP (Max 5MB)
          </p>
          
          {previewUrl && (
            <div className="image-preview">
              <h4>📷 Image Preview:</h4>
              <img src={previewUrl} alt="Receipt preview" />
            </div>
          )}
        </div>

        {extractedData && (
          <div className="extracted-data">
            <h3>📋 Extracted Information</h3>
            <div className="data-grid">
              <div>
                <strong>Amount:</strong> 
                {extractedData.amount ? `₹${extractedData.amount}` : '❌ Not found'}
              </div>
              <div>
                <strong>Merchant:</strong> 
                {extractedData.merchant || '❌ Not found'}
              </div>
              <div>
                <strong>Category:</strong> 
                {extractedData.category ? 
                  categoryOptions.find(cat => cat.value === extractedData.category)?.label || extractedData.category 
                  : '❌ Not found'}
              </div>
              <div>
                <strong>Date:</strong> 
                {extractedData.date || '❌ Not found'}
              </div>
            </div>
            {extractedData.rawText && (
              <details className="raw-text">
                <summary>View Raw Extracted Text</summary>
                <pre>{extractedData.rawText}</pre>
              </details>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="expense-form">
        <h3>✏️ Confirm & Save Expense</h3>
        <p className="form-description">
          Review and edit the extracted data, then save to your expenses.
        </p>
        
        <div className="form-group">
          <label>Amount (₹) *</label>
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
          <label>Merchant *</label>
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
            placeholder="Optional description"
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

        <div className="form-group">
          <label>Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={!formData.amount || !formData.merchant}
        >
          💾 Save Expense
        </button>

        {(!formData.amount || !formData.merchant) && (
          <p className="form-warning">
            * Please fill in required fields (Amount and Merchant)
          </p>
        )}
      </form>

      <style jsx>{`
        .scanner-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }
        
        .scanner-section, .expense-form {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .upload-area {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .upload-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #667eea;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .upload-button:hover {
          background: #5a6fd8;
        }
        
        .upload-button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }
        
        .image-preview {
          margin-top: 1rem;
        }
        
        .image-preview img {
          max-width: 100%;
          max-height: 200px;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
        }
        
        .extracted-data {
          background: #f7fafc;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-top: 1rem;
        }
        
        .data-grid {
          display: grid;
          gap: 0.5rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #4a5568;
        }
        
        .form-group input, .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 1rem;
        }
        
        .submit-button {
          width: 100%;
          padding: 0.75rem;
          background: #48bb78;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .submit-button:hover:not(:disabled) {
          background: #38a169;
        }
        
        .submit-button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }
        
        .spinner-small {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        
        .section-description, .form-description {
          color: #718096;
          margin-bottom: 20px;
          font-size: 0.95rem;
        }
        
        .upload-hint {
          color: #a0aec0;
          font-size: 0.85rem;
          margin-top: 10px;
        }
        
        .raw-text {
          margin-top: 15px;
          background: #f7fafc;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .raw-text summary {
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .raw-text pre {
          white-space: pre-wrap;
          font-size: 0.8rem;
          color: #4a5568;
          background: white;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #e2e8f0;
          max-height: 200px;
          overflow-y: auto;
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
      `}</style>
    </div>
  );
};

export default ReceiptScanner;