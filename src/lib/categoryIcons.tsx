import {
  Banknote,
  Briefcase,
  Brush,
  Building2,
  Camera,
  Car,
  ChefHat,
  Cpu,
  Flower2,
  Hammer,
  Handshake,
  Heart,
  Home as HomeIcon,
  Landmark,
  Palette,
  Scale,
  Scissors,
  Sparkles,
  Stethoscope,
  Tractor,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  administrativo: Briefcase,
  vendas: Handshake,
  logistica: Truck,
  ti: Cpu,
  construcao: Hammer,
  saude: Stethoscope,
  educacao: Landmark,
  gastronomia: ChefHat,
  financeiro: Banknote,
  producao: Building2,
  agronegocio: Tractor,
  marketing: Palette,
  hotelaria: HomeIcon,
  pedreiro: Hammer,
  eletricista: Sparkles,
  encanador: Wrench,
  consultor: Handshake,
  auditor: Scale,
  diarista: HomeIcon,
  jardineiro: Flower2,
  pintor: Brush,
  marceneiro: Hammer,
  cabeleireiro: Scissors,
  'personal-trainer': Heart,
  fotografo: Camera,
  'designer-freelancer': Palette,
  'professor-particular': Landmark,
  cuidador: Heart,
  'motorista-particular': Car,
  'tecnico-informatica': Cpu,
}

export function iconForCategory(slug: string | null | undefined): LucideIcon {
  if (!slug) return Briefcase
  return ICONS[slug] ?? Briefcase
}

// Conjunto curado (sem duplicar visual) para a empresa escolher manualmente
// o ícone da vaga quando não há foto — mesma família usada em categoryIcons,
// só que com chave e rótulo genéricos em vez de amarrado a uma categoria.
export const VAGA_ICON_OPTIONS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'geral', label: 'Geral', icon: Briefcase },
  { key: 'vendas-atendimento', label: 'Vendas / Atendimento', icon: Handshake },
  { key: 'logistica', label: 'Logística', icon: Truck },
  { key: 'tecnologia', label: 'Tecnologia', icon: Cpu },
  { key: 'construcao', label: 'Construção', icon: Hammer },
  { key: 'manutencao', label: 'Manutenção', icon: Wrench },
  { key: 'saude', label: 'Saúde', icon: Stethoscope },
  { key: 'educacao', label: 'Educação', icon: Landmark },
  { key: 'gastronomia', label: 'Gastronomia', icon: ChefHat },
  { key: 'financeiro', label: 'Financeiro', icon: Banknote },
  { key: 'producao', label: 'Produção / Indústria', icon: Building2 },
  { key: 'agronegocio', label: 'Agronegócio', icon: Tractor },
  { key: 'design-marketing', label: 'Design / Marketing', icon: Palette },
  { key: 'casa-hotelaria', label: 'Casa / Hotelaria', icon: HomeIcon },
  { key: 'beleza', label: 'Beleza', icon: Scissors },
  { key: 'cuidados', label: 'Cuidados', icon: Heart },
  { key: 'jardinagem', label: 'Jardinagem', icon: Flower2 },
  { key: 'fotografia', label: 'Fotografia', icon: Camera },
  { key: 'transporte', label: 'Transporte', icon: Car },
  { key: 'juridico-auditoria', label: 'Jurídico / Auditoria', icon: Scale },
]

export function iconForVaga(iconKey: string | null | undefined, category: string | null | undefined): LucideIcon {
  if (iconKey) {
    const found = VAGA_ICON_OPTIONS.find((o) => o.key === iconKey)
    if (found) return found.icon
  }
  return iconForCategory(category)
}
