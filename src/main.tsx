import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SmoothScroll } from './components/ui/SmoothScroll.tsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SmoothScroll>
        <App />
      </SmoothScroll>
    </ErrorBoundary>
  </StrictMode>,
)
