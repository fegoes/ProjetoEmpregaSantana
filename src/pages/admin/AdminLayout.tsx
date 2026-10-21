import { Outlet } from 'react-router-dom'
import { PanelLayout } from '@/components/layout/PanelLayout'

export default function AdminLayout() {
  return <><a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:p-3">Pular para o conteúdo</a><PanelLayout mode="admin"><Outlet /></PanelLayout></>
}
