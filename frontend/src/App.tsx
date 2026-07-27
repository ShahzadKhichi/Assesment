import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import { theme } from './theme/theme';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { TruckLoader } from './components/loaders';

// Code splitting & Lazy Loading Pages
import LoginPage from  './pages/LoginPage'
import SignupPage   from './pages/SignupPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import DashboardPage   from './pages/DashboardPage'
import TripPlannerPage   from './pages/TripPlannerPage'
import LogsPage   from './pages/LogsPage'
import TripDetailPage from './pages/TripDetailPage'



export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.2),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eef7f7_45%,_#f8fafc_100%)] text-slate-900 flex flex-col">
            <Navbar />
            <main className="flex-1">
             
                <Routes>
                  {/* Public Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Protected Application Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/planner"
                    element={
                      <ProtectedRoute>
                        <TripPlannerPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trips/:id"
                    element={
                      <ProtectedRoute>
                        <TripDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/logs"
                    element={
                      <ProtectedRoute>
                        <LogsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
             
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
