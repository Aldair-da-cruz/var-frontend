'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

interface Permissoes {
  permissaoAlertas: boolean
  permissaoGestao:  boolean
}

// Cookies antigos (emitidos antes desta funcionalidade existir) não têm
// estes campos — por omissão o acesso é total, como sempre foi.
export function useUsuarioPermissoes(): Permissoes {
  const [permissoes, setPermissoes] = useState<Permissoes>({ permissaoAlertas: true, permissaoGestao: true })

  useEffect(() => {
    try {
      const u = JSON.parse(Cookies.get('usuario') ?? '{}')
      setPermissoes({
        permissaoAlertas: u.permissaoAlertas ?? true,
        permissaoGestao:  u.permissaoGestao  ?? true,
      })
    } catch { /* ignora */ }
  }, [])

  return permissoes
}
