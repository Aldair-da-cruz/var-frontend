'use client'

import { useEffect, useState } from "react";
import Container from "@/components/container";
import PreferenciasNotificacao from "@/components/def";
import Sidebar3 from "@/components/sidbar3";
import { Bell } from "lucide-react";
import { useUsuarioNome } from "@/hooks/useUsuarioNome";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

export default function dashboard() {
    const nomeUsuario = useUsuarioNome();
    const [usuarioId, setUsuarioId] = useState('');
    const [emailAtivo, setEmailAtivo] = useState(true);
    const [idioma, setIdioma] = useState("Português (PT)");

    useEffect(() => {
        try {
            const u = JSON.parse(Cookies.get('usuario') ?? '{}');
            if (u?.id) setUsuarioId(u.id);
        } catch { /* ignora */ }
        const idiomaSalvo = typeof window !== 'undefined' ? localStorage.getItem('idioma') : null;
        if (idiomaSalvo) setIdioma(idiomaSalvo);
    }, []);

    useEffect(() => {
        if (!usuarioId) return;
        api.get(`/usuarios/${usuarioId}`).then((res) => {
            setEmailAtivo(res.data.data.notificacaoEmailAtiva);
        }).catch(() => { /* ignora */ });
    }, [usuarioId]);

    const handleToggleEmail = async (ativo: boolean) => {
        setEmailAtivo(ativo);
        if (!usuarioId) return;
        try {
            await api.patch(`/usuarios/${usuarioId}/notificacao`, { ativa: ativo });
        } catch {
            setEmailAtivo(!ativo);
        }
    };

    const handleIdiomaChange = (novoIdioma: string) => {
        setIdioma(novoIdioma);
        if (typeof window !== 'undefined') localStorage.setItem('idioma', novoIdioma);
    };

    return(
        <div>
          <Sidebar3>
            <div>
                <Container titulo="Definições" notificacao={<Bell size={20} />} usuario={nomeUsuario}>
                    <PreferenciasNotificacao
                        emailAtivo={emailAtivo}
                        onToggleEmail={handleToggleEmail}
                        idioma={idioma}
                        onIdiomaChange={handleIdiomaChange}
                    />
                </Container>
            </div>
            </Sidebar3>
        </div>
    )
}
