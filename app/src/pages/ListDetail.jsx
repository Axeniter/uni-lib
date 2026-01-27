import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLists } from '../contexts/ListsContext';
import ItemForm from '../components/ItemForm';
import CategoryForm from '../components/CategoryForm';
import ItemDetail from '../components/ItemDetail';
import Modal from '../components/Modal';

const ListDetail = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { 
    currentList, 
    fetchListDetails, 
    createCategory, 
    updateCategory,
    deleteCategory,
    createItem, 
    updateItem, 
    deleteItem 
  } = useLists();
  
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [isNoCategoryCollapsed, setIsNoCategoryCollapsed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (listId) {
      fetchListDetails(listId);
    }
  }, [listId]);

  useEffect(() => {
    if (currentList?.categories) {
      const initialCollapsedState = {};
      currentList.categories.forEach(category => {
        if (collapsedCategories[category.id] === undefined) {
          initialCollapsedState[category.id] = false;
        }
      });
      if (Object.keys(initialCollapsedState).length > 0) {
        setCollapsedCategories(prev => ({...prev, ...initialCollapsedState}));
      }
    }
  }, [currentList?.categories]);

  const handleCreateCategory = async (data) => {
    const result = await createCategory(parseInt(listId), data.name, data.order);
    if (result.success) {
      setShowCategoryModal(false);
      setError('');
      setCollapsedCategories(prev => ({...prev, [result.data.id]: false}));
    } else {
      setError(result.error);
    }
  };

  const handleUpdateCategory = async (id, data) => {
    const result = await updateCategory(id, data);
    if (result.success) {
      setEditingCategory(null);
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? All items will be moved to "No Category".')) {
      const result = await deleteCategory(id);
      if (result.success) {
        setEditingCategory(null);
        setError('');
        setCollapsedCategories(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      } else {
        setError(result.error);
      }
    }
  };

  const handleCreateItem = async (data) => {
    const result = await createItem(parseInt(listId), data);
    if (result.success) {
      setShowItemModal(false);
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleUpdateItem = async (id, data) => {
    const result = await updateItem(id, data);
    if (!result.success) {
      setError(result.error);
    } else {
      setExpandedItemId(null);
    }
    return result;
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const result = await deleteItem(id);
      if (result.success) {
        setExpandedItemId(null);
      } else {
        setError(result.error);
      }
    }
  };

  const toggleItemExpansion = (itemId) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const toggleCategoryCollapse = (categoryId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleNoCategoryCollapse = () => {
    setIsNoCategoryCollapsed(!isNoCategoryCollapsed);
  };

  const collapseAllCategories = () => {
    if (currentList.categories) {
      const allCollapsed = {};
      currentList.categories.forEach(category => {
        allCollapsed[category.id] = true;
      });
      setCollapsedCategories(allCollapsed);
      setIsNoCategoryCollapsed(true);
    }
  };

  const expandAllCategories = () => {
    if (currentList.categories) {
      const allExpanded = {};
      currentList.categories.forEach(category => {
        allExpanded[category.id] = false;
      });
      setCollapsedCategories(allExpanded);
      setIsNoCategoryCollapsed(false);
    }
  };

  if (!currentList) {
    return <div className="loading">Loading...</div>;
  }

  const itemsByCategory = {};
  const noCategoryItems = [];
  
  currentList.categories?.forEach(category => {
    itemsByCategory[category.id] = [];
  });
  
  currentList.items?.forEach(item => {
    if (item.category_id) {
      if (itemsByCategory[item.category_id]) {
        itemsByCategory[item.category_id].push(item);
      }
    } else {
      noCategoryItems.push(item);
    }
  });

  const totalItems = currentList.items?.length || 0;
  const totalCategories = currentList.categories?.length || 0;

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary"
          style={{ marginBottom: '20px' }}
        >
          ← Back to Lists
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ margin: 0, color: '#5e35b1' }}>{currentList.name}</h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowCategoryModal(true)} 
              className="btn btn-success"
            >
              + Category
            </button>
            <button 
              onClick={() => setShowItemModal(true)} 
              className="btn btn-success"
            >
              + Item
            </button>
          </div>
        </div>
        
        {currentList.description && (
          <p style={{ color: '#666', marginTop: '10px' }}>{currentList.description}</p>
        )}
        
        <div className="list-header-info">
          <div className="total-count">
            Total: {totalItems} item{totalItems !== 1 ? 's' : ''}
          </div>
          <div className="categories-count">
            {totalCategories} categor{totalCategories !== 1 ? 'ies' : 'y'}
          </div>
          <div className="items-count">
            {noCategoryItems.length} uncategorized
          </div>
        </div>

        {(totalCategories > 0 || noCategoryItems.length > 0) && (
          <div className="list-controls">
            <button 
              onClick={collapseAllCategories}
              className="btn btn-sm btn-secondary"
            >
              Collapse All
            </button>
            <button 
              onClick={expandAllCategories}
              className="btn btn-sm btn-secondary"
            >
              Expand All
            </button>
          </div>
        )}
      </div>

      {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Add Category"
      >
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={() => setShowCategoryModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Edit Category"
      >
        <CategoryForm
          initialData={editingCategory}
          onSubmit={async (data) => {
            await handleUpdateCategory(editingCategory.id, data);
          }}
          onCancel={() => setEditingCategory(null)}
        />
      </Modal>

      <Modal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        title="Add Item"
      >
        <ItemForm
          categories={currentList.categories || []}
          onSubmit={handleCreateItem}
          onCancel={() => setShowItemModal(false)}
        />
      </Modal>

      <div className="list-content">
        {noCategoryItems.length > 0 && (
          <div className="category-section">
            <div 
              className="no-category-header"
              onClick={toggleNoCategoryCollapse}
            >
              <div className="category-title-with-count">
                <span className="category-count left-count">{noCategoryItems.length}</span>
                <span>No Category</span>
              </div>
              <span className={`category-arrow ${isNoCategoryCollapsed ? 'collapsed' : ''}`}>
                ▼
              </span>
            </div>
            <div className={`category-content ${isNoCategoryCollapsed ? 'collapsed' : ''}`}>
              <div className="items-list">
                {noCategoryItems.map(item => (
                  <React.Fragment key={item.id}>
                    <div 
                      className={`item-row ${expandedItemId === item.id ? 'expanded' : ''}`}
                      onClick={() => toggleItemExpansion(item.id)}
                    >
                      <div className="item-info">
                        <span className="item-title" title={item.title}>
                          {item.title}
                        </span>
                        {item.rating && (
                          <span className="item-rating">{item.rating}/10</span>
                        )}
                      </div>
                      <div className="item-arrow">
                        {expandedItemId === item.id ? '▲' : '▼'}
                      </div>
                    </div>
                    
                    {expandedItemId === item.id && (
                      <div className="item-detail-container">
                        <ItemDetail
                          item={item}
                          categories={currentList.categories || []}
                          onUpdate={handleUpdateItem}
                          onDelete={handleDeleteItem}
                          onClose={() => setExpandedItemId(null)}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentList.categories
          ?.sort((a, b) => a.order - b.order)
          .map(category => {
            const categoryItems = itemsByCategory[category.id] || [];
            const isCollapsed = collapsedCategories[category.id];
            
            return (
              <div key={category.id} className="category-section">
                <div 
                  className="category-header"
                  onClick={() => toggleCategoryCollapse(category.id)}
                >
                  <div className="category-title-with-count">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="category-count left-count">{categoryItems.length}</span>
                      <span>{category.name}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(category);
                        }}
                        className="btn btn-sm"
                        title="Edit category"
                      >
                        ⚙️
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="btn btn-sm"
                        title="Delete category"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                  <span className={`category-arrow ${isCollapsed ? 'collapsed' : ''}`}>
                    ▼
                  </span>
                </div>
                
                <div className={`category-content ${isCollapsed ? 'collapsed' : ''}`}>
                  <div className="items-list">
                    {categoryItems.map(item => (
                      <React.Fragment key={item.id}>
                        <div 
                          className={`item-row ${expandedItemId === item.id ? 'expanded' : ''}`}
                          onClick={() => toggleItemExpansion(item.id)}
                        >
                          <div className="item-info">
                            <span className="item-title" title={item.title}>
                              {item.title}
                            </span>
                            {item.rating && (
                              <span className="item-rating">{item.rating}/10</span>
                            )}
                          </div>
                          <div className="item-arrow">
                            {expandedItemId === item.id ? '▲' : '▼'}
                          </div>
                        </div>
                        
                        {expandedItemId === item.id && (
                          <div className="item-detail-container">
                            <ItemDetail
                              item={item}
                              categories={currentList.categories || []}
                              onUpdate={handleUpdateItem}
                              onDelete={handleDeleteItem}
                              onClose={() => setExpandedItemId(null)}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                    
                    {categoryItems.length === 0 && (
                      <div className="empty-category">
                        No items in this category
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        
        {(!currentList.categories || currentList.categories.length === 0) && 
         (!currentList.items || currentList.items.length === 0) && (
          <div className="empty-state">
            <p>No items yet. Add your first item!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListDetail;