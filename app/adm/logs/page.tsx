'use client'
import Container from "@/components/container"
import Sidebar from "@/components/sidebar"
import PainelLogs from "@/components/painelLogs"
import { Bell } from "lucide-react"
import { useUsuarioNome } from "@/hooks/useUsuarioNome"

export default function LogsAdm() {
  const nomeUsuario = useUsuarioNome()

  return (
    <div>
      <Sidebar>
        <Container titulo="Logs & Auditoria" notificacao={<Bell size={20} />} usuario={nomeUsuario || 'ADM'}>
          <PainelLogs />
        </Container>
      </Sidebar>
    </div>
  )
}
