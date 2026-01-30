import React, { useState } from 'react';
import ItemForm from './ItemForm';

const ItemDetail = ({ item, categories, onUpdate, onDelete, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data) => {
    const result = await onUpdate(item.id, data);
    if (result.success) {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="item-detail">
        <h4>Edit Item</h4>
        <ItemForm
          initialData={item}
          categories={categories}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="item-detail">
      <div className="item-detail-content">
        <h4 style={{ marginBottom: '15px', color: '#333' }}>{item.title}</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <p><strong>Comment:</strong></p>
          <p style={{ color: '#666', marginTop: '5px', whiteSpace: 'pre-wrap' }}>
            {item.comment || 'No comment'}
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <strong>Rating:</strong>
            <div style={{ color: '#ca3ffc', fontWeight: 'bold', marginTop: '5px' }}>
              {item.rating ? `${item.rating}/10` : 'No rating'}
            </div>
          </div>
          <div>
            <strong>Category:</strong>
            <div style={{ color: '#666', marginTop: '5px' }}>
              {categories.find(c => c.id === item.category_id)?.name || 'No category'}
            </div>
          </div>
        </div>
        
        <div style={{ fontSize: '12px', color: '#999', marginBottom: '15px' }}>
          <strong>Created:</strong> {new Date(item.created_at).toLocaleString()}
          {item.updated_at && (
            <>
              <br />
              <strong>Updated:</strong> {new Date(item.updated_at).toLocaleString()}
            </>
          )}
        </div>
        
        <div className="item-detail-actions">
          <button 
            onClick={() => setIsEditing(true)} 
            className="btn btn-secondary"
            title="Edit"
          >
            ✏️ Edit
          </button>
          <button 
            onClick={() => onDelete(item.id)} 
            className="btn btn-danger"
            title="Delete"
          >
            ✕ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;