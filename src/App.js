import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './providers/i18next.jsx';
import LoadingScreen from './components/LoadingScreen/LoadingScreen.jsx';

const Login = React.lazy(() => import('./pages/Login/Login.jsx'));

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
            <Route element={<Login />} path="/" />
          </Routes>
        </React.Suspense>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;