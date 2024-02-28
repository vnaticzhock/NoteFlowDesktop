import React from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './providers/i18next.jsx'
import LoadingScreen from './components/LoadingScreen/LoadingScreen.jsx'
import ForgotPassword from './pages/LoginPage/ForgotPassword.jsx'
import Register from './pages/LoginPage/Register.jsx'
import LoginPage from './pages/LoginPage/Page.jsx'
import MainPage from './pages/Main/Page.jsx'
import FlowGrid from './components/FlowGrid/FlowGrid.jsx'
import Library from './components/Library/Library.jsx'
import Calendar from './components/Calendar/Calendar.jsx'
import Settings from './components/Editor/EditorSettings.jsx'
import Flow from './components/Flow/Flow.jsx'

const Login = React.lazy(() => import('./pages/LoginPage/Login.jsx'))

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
              <Route path="" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="register" element={<Register />} />
            </Route>
            <Route path="/" element={<MainPage />}>
              <Route index element={<FlowGrid />} />
              <Route path="library" element={<Library />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="setting" element={<Settings />} />
              <Route path="flow" element={<Flow />} />
            </Route>
          </Routes>
        </React.Suspense>
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App
