import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomerProvider>
          <AppRoutes />
        </CustomerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
