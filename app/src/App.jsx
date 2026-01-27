import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ListsProvider } from './contexts/ListsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ListsProvider>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Lists /></ProtectedRoute>} />
            <Route path="/lists/:listId" element={<ProtectedRoute><ListDetail /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ListsProvider>
    </AuthProvider>
  );
}

export default App;