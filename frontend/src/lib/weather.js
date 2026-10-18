// Busca da previsão do tempo na Open-Meteo (gratuita, sem chave de API).

import { useEffect, useState } from 'react'
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudLightning } from 'lucide-react'

export const CIDADES = [
  { nome: 'Recife', lat: -8.05, lon: -34.88 },
  { nome: 'Gravatá', lat: -8.2, lon: -35.57 },
  { nome: 'Caruaru', lat: -8.28, lon: -35.97 },
  { nome: 'Garanhuns', lat: -8.89, lon: -36.49 },
  { nome: 'Serra Talhada', lat: -7.99, lon: -38.3 },
  { nome: 'Petrolina', lat: -9.39, lon: -40.5 },
]

export function describe(code) {
  if (code === 0) return { texto: 'Céu limpo', Icon: Sun }
  if (code === 1 || code === 2) return { texto: 'Parcialmente nublado', Icon: CloudSun }
  if (code === 3) return { texto: 'Nublado', Icon: Cloud }
  if (code === 45 || code === 48) return { texto: 'Neblina', Icon: CloudFog }
  if (code >= 51 && code <= 57) return { texto: 'Garoa', Icon: CloudDrizzle }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { texto: 'Chuva', Icon: CloudRain }
  if (code >= 95) return { texto: 'Trovoadas', Icon: CloudLightning }
  return { texto: 'Nublado', Icon: Cloud }
}

// Previsão gratuita da Open-Meteo (não precisa de chave de API)
export function useWeather(lat, lon) {
  const [s, setS] = useState({ loading: true, data: null, error: null })
  useEffect(() => {
    const ctrl = new AbortController()
    setS({ loading: true, data: null, error: null })
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
      `&forecast_days=4&timezone=America%2FRecife`
    fetch(url, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Erro ' + r.status)
        return r.json()
      })
      .then((data) => setS({ loading: false, data, error: null }))
      .catch((e) => {
        if (e.name !== 'AbortError') setS({ loading: false, data: null, error: e.message })
      })
    return () => ctrl.abort()
  }, [lat, lon])
  return s
}

// Há chuva forte prevista nos próximos 3 dias?
export function riscoChuva(data, limiarMm) {
  if (!data?.daily) return null
  const dias = data.daily.time.slice(0, 3).map((t, i) => ({ data: t, mm: data.daily.precipitation_sum[i] || 0 }))
  const forte = dias.filter((d) => d.mm >= limiarMm)
  return forte.length ? { dias, forte, max: Math.max(...dias.map((d) => d.mm)) } : null
}
