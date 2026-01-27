import React, { createContext, useState, useContext } from 'react';
import { listsAPI, categoriesAPI, itemsAPI } from '../api';

const ListsContext = createContext({});

export const useLists = () => useContext(ListsContext);

export const ListsProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const response = await listsAPI.getLists();
      if (response.success) {
        const listsWithDefaults = response.data.map(list => ({
          ...list,
          items_count: 0,
          categories_count: 0
        }));
        setLists(listsWithDefaults);
      } else {
        console.error('Error fetching lists:', response.error);
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createList = async (name, description) => {
    const result = await listsAPI.createList({ name, description });
    
    if (result.success) {
      const newList = {
        ...result.data,
        items_count: 0,
        categories_count: 0
      };
      setLists([newList, ...lists]);
      return { success: true, data: newList };
    } else {
      return { 
        success: false, 
        error: result.error
      };
    }
  };

  const updateList = async (id, data) => {
    const result = await listsAPI.updateList(id, data);
    
    if (result.success) {
      const existingList = lists.find(list => list.id === id);
      const updatedList = {
        ...result.data,
        items_count: existingList?.items_count || 0,
        categories_count: existingList?.categories_count || 0
      };
      
      setLists(lists.map(list => list.id === id ? updatedList : list));
      return { success: true };
    } else {
      return { 
        success: false, 
        error: result.error
      };
    }
  };

  const deleteList = async (id) => {
    const result = await listsAPI.deleteList(id);
    
    if (result.success) {
      setLists(lists.filter(list => list.id !== id));
      return { success: true };
    } else {
      return { 
        success: false, 
        error: result.error
      };
    }
  };

  const fetchListDetails = async (id) => {
    setLoading(true);
    try {
      const response = await listsAPI.getFullList(id);
      if (response.success) {
        setCurrentList(response.data);
      } else {
        console.error('Error fetching list details:', response.error);
      }
    } catch (error) {
      console.error('Error fetching list details:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (listId, name, order = 0) => {
    const result = await categoriesAPI.createCategory(listId, { name, order });
    
    if (result.success) {
      setLists(lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            categories_count: (list.categories_count || 0) + 1
          };
        }
        return list;
      }));
      
      if (currentList?.id === listId) {
        setCurrentList({
          ...currentList,
          categories: [...currentList.categories, result.data]
        });
      }
      
      return { success: true, data: result.data };
    } else {
      return { 
        success: false, 
        error: result.error
      };
    }
  };

  const updateCategory = async (id, data) => {
    const result = await categoriesAPI.updateCategory(id, data);
    
    if (result.success) {
      if (currentList) {
        setCurrentList({
          ...currentList,
          categories: currentList.categories.map(category => 
            category.id === id ? result.data : category
          )
        });
      }
      
      return { success: true };
    } else {
      return { 
        success: false, 
        error: result.error
      };
    }
  };

  const deleteCategory = async (id) => {
    const result = await categoriesAPI.deleteCategory(id);
    
    if (result.success) {
        if (currentList) {
        const deletedCategory = currentList.categories.find(c => c.id === id);
        
        const updatedItems = currentList.items.map(item => {
            if (item.category_id === id) {
            return {
                ...item,
                category_id: null
            };
            }
            return item;
        });
        
        setCurrentList({
            ...currentList,
            categories: currentList.categories.filter(category => category.id !== id),
            items: updatedItems
        });
        
        setLists(lists.map(list => {
            if (list.id === currentList.id) {
            return {
                ...list,
                categories_count: Math.max(0, (list.categories_count || 0) - 1)
            };
            }
            return list;
        }));
        }
        
        return { success: true };
    } else {
        return { 
        success: false, 
        error: result.error
        };
    }
    };

  const createItem = async (listId, data) => {
    const result = await itemsAPI.createItem(listId, data);
    
    if (result.success) {
      setLists(lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items_count: (list.items_count || 0) + 1
          };
        }
        return list;
      }));
      
      if (currentList?.id === listId) {
        setCurrentList({
          ...currentList,
          items: [result.data, ...currentList.items]
        });
      }
      
      return { success: true, data: result.data };
    } else {
      return { 
        success: false, 
        error: result.error
      };
    }
  };

  const updateItem = async (id, data) => {
    const result = await itemsAPI.updateItem(id, data);
    
    if (result.success) {
      if (currentList) {
        setCurrentList({
          ...currentList,
          items: currentList.items.map(item => 
            item.id === id ? result.data : item
          )
        });
      }
      
      return { success: true };
    } else {
      return { 
        success: false, 
        error: result.error
      };
    }
  };

  const deleteItem = async (id) => {
    const result = await itemsAPI.deleteItem(id);
    
    if (result.success) {
      if (currentList) {
        setLists(lists.map(list => {
          if (list.id === currentList.id) {
            return {
              ...list,
              items_count: Math.max(0, (list.items_count || 0) - 1)
            };
          }
          return list;
        }));
        
        setCurrentList({
          ...currentList,
          items: currentList.items.filter(item => item.id !== id)
        });
      }
      
      return { success: true };
    } else {
      return { 
        success: false, 
        error: result.error
      };
    }
  };

  const value = {
    lists,
    currentList,
    loading,
    fetchLists,
    createList,
    updateList,
    deleteList,
    fetchListDetails,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem
  };

  return (
    <ListsContext.Provider value={value}>
      {children}
    </ListsContext.Provider>
  );
};