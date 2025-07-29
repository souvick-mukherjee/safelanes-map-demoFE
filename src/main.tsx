import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.tsx'
import { LoadScript } from '@react-google-maps/api'
import type { Libraries } from '@react-google-maps/api'

const libraries: Libraries = ['places']
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={libraries}
    >
      <App />
    </LoadScript>
  </StrictMode>,
)
