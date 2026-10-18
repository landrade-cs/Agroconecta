import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { seed } from './seed'

const KEY = 'agroconecta:v1'
const Ctx = createContext(null)

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3)

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...seed(), ...JSON.parse(raw) }
  } catch (e) {
    /* ignora dados corrompidos */
  }
  return seed()
}

function reducer(state, a) {
  switch (a.type) {
    case 'add':
      return { ...state, [a.col]: [...state[a.col], { ...a.item, id: uid(), createdAt: new Date().toISOString() }] }
    case 'update':
      return { ...state, [a.col]: state[a.col].map((i) => (i.id === a.id ? { ...i, ...a.patch } : i)) }
    case 'remove':
      return { ...state, [a.col]: state[a.col].filter((i) => i.id !== a.id) }
    case 'setConfig':
      return { ...state, config: { ...state.config, ...a.patch } }
    case 'replace':
      return { ...seed(), ...a.state }
    case 'reset':
      return seed()
    case 'clear': {
      const empty = {}
      Object.keys(state).forEach((k) => {
        if (Array.isArray(state[k])) empty[k] = []
      })
      return { ...state, ...empty }
    }
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch (e) {
      /* armazenamento cheio ou indisponível */
    }
  }, [state])

  const api = useMemo(
    () => ({
      state,
      add: (col, item) => dispatch({ type: 'add', col, item }),
      update: (col, id, patch) => dispatch({ type: 'update', col, id, patch }),
      remove: (col, id) => dispatch({ type: 'remove', col, id }),
      setConfig: (patch) => dispatch({ type: 'setConfig', patch }),
      replace: (s) => dispatch({ type: 'replace', state: s }),
      reset: () => dispatch({ type: 'reset' }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [state]
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
