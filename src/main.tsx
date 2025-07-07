
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PWAService } from './services/pwaService'

// Initialize PWA services
PWAService.initialize();

// Add PWA install prompt
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show install button or banner
  const installBanner = document.createElement('div');
  installBanner.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; background: #3b82f6; color: white; padding: 12px; text-align: center; z-index: 9999;">
      <span>Install Lifebook Health for a better experience!</span>
      <button id="install-app" style="margin-left: 12px; background: white; color: #3b82f6; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer;">Install</button>
      <button id="dismiss-install" style="margin-left: 8px; background: transparent; color: white; border: 1px solid white; padding: 4px 12px; border-radius: 4px; cursor: pointer;">Maybe Later</button>
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  document.getElementById('install-app')?.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        document.body.removeChild(installBanner);
      });
    }
  });
  
  document.getElementById('dismiss-install')?.addEventListener('click', () => {
    document.body.removeChild(installBanner);
  });
});

createRoot(document.getElementById("root")!).render(<App />);
