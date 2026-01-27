import React, { useState } from 'react';

const CategoryForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    order: initialData.order || 0
  });
  
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <div className="form-group">
        <label>Category Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({...formData, name: e.target.value});
            if (errors.name) setErrors({...errors, name: ''});
          }}
          placeholder="Enter category name (max 100 chars)"
          maxLength="100"
          required
        />
        {errors.name && <div className="error">{errors.name}</div>}
        <div style={{ fontSize: '12px', color: '#666', textAlign: 'right', marginTop: '5px' }}>
          {formData.name.length}/100
        </div>
      </div>
      <div className="form-group">
        <label>Order</label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
          min="0"
        />
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button type="submit" className="btn btn-primary">
          {initialData.name ? 'Update' : 'Create'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;