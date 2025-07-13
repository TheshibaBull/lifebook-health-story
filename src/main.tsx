import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PWAService } from './services/pwaService'

// Initialize PWA services in production only
if (process.env.NODE_ENV === 'production') {
  PWAService.initialize();
}

// Create root with strict mode for better development experience
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found");
}
