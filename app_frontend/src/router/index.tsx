import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginV1 as Login } from '../views/Login';
import MainLayout from '../layouts/MainLayout';
import NotFound from '../views/NotFound';
import PlaceholderPage from '../views/PlaceHolderPage';
import { flatMenuItems } from '../data/menuData';

// Lazy-loaded real pages, keyed by menu item id.
const Dashboard = lazy(() => import('../views/Dashboard'));
const CompanyInfo = lazy(() => import('../views/Company/CompanyInfo'));

const routeComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'company-info': CompanyInfo,
};

export default function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

      <Route
        path="/"
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        {flatMenuItems.map((item) => {
          const RealComponent = routeComponents[item.id];
          return (
            <Route
              key={item.id}
              path={item.route!.replace(/^\//, '')}
              element={
                RealComponent ? (
                  <Suspense fallback={<div className="p-6">Loading…</div>}>
                    <RealComponent />
                  </Suspense>
                ) : (
                  <PlaceholderPage title={item.label} />
                )
              }
            />
          );
        })}

        {/* Any unmatched path inside the authenticated shell */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Any unmatched path outside the authenticated shell (e.g. not logged in) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}