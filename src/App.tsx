import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import HirerProfile from './components/hirer/HirerProfile';

// page imports
import Home from './pages/Home';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import HirerPage from './pages/HirerPage';
import VendorPage from './pages/VendorPage';

// confirm app routes and role-based access control
const AppSetup = () => {
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/hirer"
          element={
            <ProtectedRoute requiredRole="hirer">
              <HirerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute requiredRole="hirer">
              <HirerProfile />
            </ProtectedRoute>
          }
        />
        {/*redirect unknown url to home*/} 
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppSetup />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;