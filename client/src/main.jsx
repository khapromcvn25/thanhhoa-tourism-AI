import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './index.css';
import App from './App';
import { ThemeProvider } from '@/context/ThemeContext';
import { PlacesProvider } from '@/context/PlacesContext';
import { UserPlacesProvider } from '@/context/UserPlacesContext';
import { initAos } from '@/lib/aos';

initAos();

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <PlacesProvider>
        <UserPlacesProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UserPlacesProvider>
      </PlacesProvider>
    </ThemeProvider>
  </StrictMode>,
);
