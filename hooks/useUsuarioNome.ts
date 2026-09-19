'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

export function useUsuarioNome(): string {
  const [nome, setNome] = useState('')

  useEffect(() => {
    try { setNome(JSON.parse(Cookies.get('usuario') ?? '{}').nome ?? '') } catch { /* ignora */ }
  }, [])

  return nome
}
