import React from 'react';

import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import AuthPage from './pages/loginPage/login';
import Dashboard from './pages/dashboardPage/db';
import PrivateRoute from './utils/PrivateRoute';

const App = () => (
  <div className="App">
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard/:suid" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        {/* Add other routes here */}
      </Routes>
    </Router>
  </AuthProvider>
  </div>
);

export default App;
