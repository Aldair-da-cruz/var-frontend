'use client'

import { useEffect, useState } from 'react'

export type Tema = 'dark' | 'light'

export function useTema() {
  const [tema, setTemaState] = useState<Tema>('dark')

  useEffect(() => {
    const salvo = (typeof window !== 'undefined' && localStorage.getItem('tema')) as Tema | null
    if (salvo) setTemaState(salvo)
  }, [])

  const aplicarTema = (novoTema: Tema) => {
    setTemaState(novoTema)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tema', novoTema)
      document.documentElement.setAttribute('data-tema', novoTema)
    }
  }

  return { tema, aplicarTema }
}
