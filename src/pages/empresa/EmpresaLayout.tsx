import { Outlet } from 'react-router-dom'
import { EmpresaProvider } from '@/contexts/EmpresaContext'

export default function EmpresaLayout() {
  return (
    <EmpresaProvider>
      <Outlet />
    </EmpresaProvider>
  )
}
