'use client'
import Container from "@/components/container"
import Sidebar3 from "@/components/sidbar3"
import PainelLogs from "@/components/painelLogs"
import { Bell } from "lucide-react"
import { useUsuarioNome } from "@/hooks/useUsuarioNome"

export default function LogsOperacional() {
  const nomeUsuario = useUsuarioNome()

  return (
    <div>
      <Sidebar3>
        <Container titulo="Logs & Auditoria" notificacao={<Bell size={20} />} usuario={nomeUsuario}>
          <PainelLogs />
        </Container>
      </Sidebar3>
    </div>
  )
}
