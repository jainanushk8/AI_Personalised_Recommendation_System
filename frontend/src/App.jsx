import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './components/Login.jsx';
import SignupPage from './components/Signup.jsx';
import ItemListPage from './components/ItemList.jsx'; // This will be our main dashboard
import ItemDetailPage from './components/ItemDetail.jsx';
import PreferencesPage from './components/Preferences.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx'; // We'll create AuthContext soon

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider> {/* AuthProvider makes auth context available everywhere */}
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      <nav style={{ padding: '10px 0', marginBottom: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'center', margin: 0 }}>
          <li style={{ margin: '0 15px' }}><Link to="/items" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Dashboard</Link></li>
          {isAuthenticated ? (
            <>
              <li style={{ margin: '0 15px' }}><Link to="/profile" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Profile</Link></li>
              <li style={{ margin: '0 15px' }}><button onClick={logout} style={{ background: 'none', border: 'none', padding: 0, color: '#dc3545', cursor: 'pointer', fontSize: '1em' }}>Logout</button></li>
            </>
          ) : (
            <>
              <li style={{ margin: '0 15px' }}><Link to="/login" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Login</Link></li>
              <li style={{ margin: '0 15px' }}><Link to="/signup" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Signup</Link></li>
            </>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<Navigate to="/items" replace />} /> {/* Redirect root to items */}
        <Route path="/items" element={<PrivateRoute><ItemListPage /></PrivateRoute>} />
        <Route path="/items/:id" element={<PrivateRoute><ItemDetailPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><PreferencesPage /></PrivateRoute>} />
        {/* Add more routes here as needed */}
      </Routes>
    </>
  );
}

export default App;