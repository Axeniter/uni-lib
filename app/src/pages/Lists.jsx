import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLists } from '../contexts/ListsContext';
import ListForm from '../components/ListForm';
import Modal from '../components/Modal';

const Lists = () => {
  const { lists, fetchLists, createList, updateList, deleteList } = useLists();
  const [showListModal, setShowListModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreateList = async (data) => {
    const result = await createList(data.name, data.description);
    if (result.success) {
      setShowListModal(false);
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleUpdateList = async (id, data) => {
    const result = await updateList(id, data);
    if (result.success) {
      setEditingList(null);
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleDeleteList = async (id) => {
    if (window.confirm('Are you sure you want to delete this list? All categories and items will be deleted too.')) {
      const result = await deleteList(id);
      if (!result.success) {
        setError(result.error);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Lists</h1>
        <button 
          onClick={() => setShowListModal(true)} 
          className="btn btn-success"
        >
          + New List
        </button>
      </div>

      {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

      <Modal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        title="Create New List"
      >
        <ListForm
          onSubmit={handleCreateList}
          onCancel={() => setShowListModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingList}
        onClose={() => setEditingList(null)}
        title="Edit List"
      >
        <ListForm
          initialData={editingList}
          onSubmit={(data) => handleUpdateList(editingList.id, data)}
          onCancel={() => setEditingList(null)}
        />
      </Modal>

      {lists.length === 0 ? (
        <div className="empty-state">
          <p>No lists yet. Create your first list!</p>
        </div>
      ) : (
        <div className="lists-grid">
          {lists.map(list => (
            <div 
              key={list.id} 
              className="list-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>
                  <Link to={`/lists/${list.id}`} style={{ color: '#5e35b1', textDecoration: 'none' }}>
                    {list.name}
                  </Link>
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setEditingList(list)} 
                    className="btn btn-sm btn-secondary"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteList(list.id)} 
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {list.description && (
                <p style={{ color: '#666', marginBottom: '10px' }}>{list.description}</p>
              )}
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '12px',
                  background: '#9c27b0',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  {list.items_count || 0} items
                </span>
                <span style={{
                  fontSize: '12px',
                  background: '#9c27b0',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  {list.categories_count || 0} categories
                </span>
              </div>
              
              <div style={{ fontSize: '12px', color: '#9e9e9e' }}>
                Created: {new Date(list.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lists;