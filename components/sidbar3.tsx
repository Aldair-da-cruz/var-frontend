"use client"

import Link from "next/link"
import Cookies from 'js-cookie'
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  Bell,
  FileText,
  User,
  Settings,
  LogOut,
  X,
  CreditCard,
  History
} from "lucide-react"

export default function Sidebar3({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const isActive = (path: string) => {
        return pathname === path 
            ? "bg-white/5 border-l-4 border-[#0311ab] text-white" 
            : "text-white hover:bg-white/5"
    }



const handleLogout = () => {
    Cookies.remove('token')
    Cookies.remove('usuario')
    setShowLogoutModal(false)
    window.location.href = "/"
}

    return (
        <div className="flex h-screen bg-[#1a1a27]">
            {/* Sidebar */}
            <div className="w-[260px] h-full bg-[#040927] text-white flex flex-col border-r border-[#333344]">
                {/* Logo */}
                <div className="p-6 border-b border-[#333344] flex items-center  gap-2">
                    <div className="bg-black w-[50px] h-[50px] rounded-full flex items-center justify-center">
                        <img src="/logo.png" alt="Logo" width={30} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mt-1.5">Kituxi Tech</h1>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 flex flex-col gap-2">
                    <Link
                        href="/operacional/dashboard"
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ml-3 mr-5 rounded-br-xl rounded-tr-xl rounded-bl-xl rounded-tl-xl duration-300 ease-in-out ${isActive("/operacional/dashboard")}`}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/operacional/gerir_empresa"
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ml-3 mr-5 rounded-br-xl rounded-tr-xl rounded-bl-xl rounded-tl-xl duration-300 ease-in-out ${isActive("/operacional/gerir_empresa")}`}
                    >
                        <Building2 size={18} />
                        <span>Gerir empresas</span>
                    </Link>

                    <Link
                        href="/operacional/gerir_alerta"
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ml-3 mr-5 rounded-br-xl rounded-tr-xl rounded-bl-xl rounded-tl-xl duration-300 ease-in-out ${isActive("/operacional/gerir_alerta")}`}
                    >
                        <AlertTriangle size={18} />
                        <span>Gestão de alertas</span>
                    </Link>

                    <Link
                        href="/operacional/licencas"
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ml-3 mr-5 rounded-br-xl rounded-tr-xl rounded-bl-xl rounded-tl-xl duration-300 ease-in-out ${isActive("/operacional/licencas")}`}
                    >
                        <CreditCard size={18} />
                        <span>Licenças & Pagamentos</span>
                    </Link>

                    <Link
                        href="/operacional/notificacao"
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ml-3 mr-5 rounded-br-xl rounded-tr-xl rounded-bl-xl rounded-tl-xl duration-300 ease-in-out ${isActive("/operacional/notificacao")}`}
                    >
                        <Bell size={18} />
                        <span>Notificações</span>
                    </Link>

                    <Link
                        href="/operacional/relatorio"
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ml-3 mr-5 rounded-br-xl rounded-tr-xl rounded-bl-xl rounded-tl-xl duration-300 ease-in-out ${isActive("/operacional/relatorio")}`}
                    >
                        <FileText size={18} />
                        <span>Relatórios</span>
                    </Link>

                    <Link
                        href="/operacional/perfil"
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ml-3 mr-5 rounded-br-xl rounded-tr-xl rounded-bl-xl rounded-tl-xl duration-300 ease-in-out ${isActive("/operacional/perfil")}`}
                    >
                        <User size={18} />
                        <span>Perfil</span>
                    </Link>

                    <Link
                        href="/operacional/definicao"
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ml-3 mr-5 rounded-br-xl rounded-tr-xl rounded-bl-xl rounded-tl-xl duration-300 ease-in-out ${isActive("/operacional/definicao")}`}
                    >
                        <Settings size={18} />
                        <span>Definições</span>
                    </Link>

                    <Link
                        href="/operacional/logs"
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ml-3 mr-5 rounded-br-xl rounded-tr-xl rounded-bl-xl rounded-tl-xl duration-300 ease-in-out ${isActive("/operacional/logs")}`}
                    >
                        <History size={18} />
                        <span>Logs</span>
                    </Link>
                </nav>

                {/* Logout */}
                <div className="p-6 border-t border-[#333344]">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                    >
                        <LogOut size={18} color="red" />
                        <span>Sair</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-[#03031b] text-white">
                {children}
            </main>

            {/* Modal de confirmação de logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Confirmar saída</h2>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <p className="text-gray-300 mb-6">
                            Tem certeza que deseja sair da sua conta?
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleLogout}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Sair
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 bg-[#1a2942] hover:bg-[#253657] text-white font-medium py-2 px-4 rounded-lg transition-colors border border-[#050e4c]"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}