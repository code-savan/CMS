// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { FileText, Layout, LogOut, Plus, User } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ContractForm from './pages/ContractForm';
import ContractDetails from './pages/ContractDetails';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import EditContract from './pages/EditContract';
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/contracts/new"
                element={
                  <PrivateRoute>
                    <ContractForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/contracts/:id"
                element={
                  <PrivateRoute>
                    <ContractDetails />

                  </PrivateRoute>
                }
              />
              <Route
                path="/contracts/:id/edit"
                element={
                  <PrivateRoute>
                    <EditContract />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
