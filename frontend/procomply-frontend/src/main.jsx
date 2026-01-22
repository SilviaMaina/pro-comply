import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useAuthstore } from './context/useAuthstore';
import './index.css';
import App from './App.jsx';


function useInitializeAuth() {
  const checkAuth = useAuthstore((state) => state.checkAuth);
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
}

function Root() {
  useInitializeAuth();
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
