// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './hooks/useAuth';
import {LoginV1 as Login} from './views/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './views/Dashboard';
import NotFound from './views/NotFound';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Global React Toastify Container */}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" 
        limit={3} 
        style={{ width: 'min(480px, 90%)' }} 
      />


      {/*App Routes*/}
      <Routes>
        <Route path="/login" element={ isAuthenticated ? <Navigate to="/" /> : <Login />} />

        <Route
          path="/"
          element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add other protected routes */}
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/*Global Not found*/}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}