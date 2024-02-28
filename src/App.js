import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './providers/i18next.jsx';
import LoadingScreen from './components/LoadingScreen/LoadingScreen.jsx';
import ForgotPassword from './pages/LoginPage/ForgotPassword.jsx';
import Register from './pages/LoginPage/Register.jsx';
import LoginPage from './pages/LoginPage/Page.jsx';
import MainPage from './pages/Main/Page.jsx';

const Login = React.lazy(() => import('./pages/LoginPage/Login.jsx'));

const App = () => {

  return (
    <BrowserRouter>
      <LanguageProvider>
        <React.Suspense
          fallback={
            <div
              className="loadingContainer"
              style={{
                width: '100vw',
                height: '100vh',
                position: 'relative',
                background: '#e6e6e6',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(45% - 75px)',
                  left: 'calc(50% - 75px)',
                }}
              >
                <LoadingScreen />
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<LoginPage />}>
              <Route path="" element={<Login />}/>
              <Route path="forgot-password" element={<ForgotPassword/>}/>
              <Route path="register" element={<Register />} />
            </Route>
            <Route path="/" element={<MainPage />} />
          </Routes>
        </React.Suspense>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;