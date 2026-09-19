import type { Equipamento as EquipamentoAPI } from "@/types"
import type { Equipamento as EquipamentoUI } from "@/components/listaEquip"

export function mapEquipamento(item: EquipamentoAPI): EquipamentoUI {
  const emManutencao = item.status === 'Manutencao'
  const temAlertas = (item._count?.alertas ?? 0) > 0

  return {
    id:      item.id,
    nome:    item.nome,
    local:   item.localizacao,
    status:  emManutencao ? 'aviso' : (temAlertas ? 'aviso' : 'online'),
    detalhe: [item.modelo, item.fabricante].filter(Boolean).join(' · '),
    aviso:   emManutencao
      ? 'Em manutenção'
      : (temAlertas ? `${item._count!.alertas} alerta(s) por resolver` : null),
  }
}
