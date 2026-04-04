import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProgressProvider } from './context/ProgressContext'
import AppRouter from './router/AppRouter'

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#16161f',
              color: '#f1f1f5',
              border: '1px solid #1e1e2e',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#16161f' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#16161f' } },
          }}
        />
      </ProgressProvider>
    </AuthProvider>
  )
}
