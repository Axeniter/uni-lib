import React, { useState, useEffect } from 'react';

const ItemForm = ({ onSubmit, onCancel, initialData = {}, categories = [] }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    comment: initialData.comment || '',
    rating: initialData.rating || '',
    category_id: initialData.category_id || ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData.title) {
      setFormData({
        title: initialData.title || '',
        comment: initialData.comment || '',
        rating: initialData.rating || '',
        category_id: initialData.category_id || ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }
    
    if (formData.rating && (formData.rating < 1 || formData.rating > 10)) {
      newErrors.rating = 'Rating must be between 1 and 10';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    const data = {
      ...formData,
      rating: formData.rating ? parseInt(formData.rating) : null,
      category_id: formData.category_id || null
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => {
            setFormData({...formData, title: e.target.value});
            if (errors.title) setErrors({...errors, title: ''});
          }}
          placeholder="Enter item title (max 200 chars)"
          maxLength="200"
          required
        />
        {errors.title && <div className="error">{errors.title}</div>}
        <div style={{ fontSize: '12px', color: '#666', textAlign: 'right', marginTop: '5px' }}>
          {formData.title.length}/200
        </div>
      </div>
      <div className="form-group">
        <label>Comment</label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({...formData, comment: e.target.value})}
          placeholder="Enter comment"
          rows="3"
        />
      </div>
      <div className="form-group">
        <label>Rating (1-10)</label>
        <input
          type="number"
          value={formData.rating}
          onChange={(e) => {
            setFormData({...formData, rating: e.target.value});
            if (errors.rating) setErrors({...errors, rating: ''});
          }}
          min="1"
          max="10"
          placeholder="1-10"
        />
        {errors.rating && <div className="error">{errors.rating}</div>}
      </div>
      <div className="form-group">
        <label>Category</label>
        <select
          value={formData.category_id}
          onChange={(e) => setFormData({...formData, category_id: e.target.value})}
        >
          <option value="">No Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button type="submit" className="btn btn-primary">
          {initialData.title ? 'Update' : 'Create'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ItemForm;