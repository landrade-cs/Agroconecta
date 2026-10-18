import { AuthProvider } from './context/AuthContext'
import { firebaseConfigurado } from './firebase/config'
import ConfiguracaoPendente from './components/ConfiguracaoPendente'
import AppRoutes from './routes'

export default function App() {
  if (!firebaseConfigurado) return <ConfiguracaoPendente />

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
