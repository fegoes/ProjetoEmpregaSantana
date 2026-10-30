import { Outlet, useNavigate } from 'react-router-dom'
import { EmpresaProvider, useEmpresa } from '@/contexts/EmpresaContext'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

function CompanyWorkspace() {
  const {empresa,empresas,error,refresh,selectEmpresa}=useEmpresa()
  const navigate=useNavigate()
  if(error)return <div role="alert" className="space-y-3"><p>Não foi possível carregar suas empresas.</p><Button variant="outline" onClick={()=>refresh()}>Tentar novamente</Button></div>
  return <div className="space-y-6">{empresas.length>1&&<div className="max-w-xl space-y-2"><Label htmlFor="workspace-company">Empresa que você está gerenciando</Label><select id="workspace-company" value={empresa?.id??''} className="min-h-11 w-full rounded-md border bg-card px-3 text-sm" onChange={e=>{if(window.confirm('Trocar de empresa? Alterações ainda não salvas nesta tela serão descartadas.')){selectEmpresa(e.target.value);navigate('/empresa/painel')}}}>{empresas.map(e=><option key={e.id} value={e.id}>{e.nome_fantasia}</option>)}</select></div>}<div key={empresa?.id??'none'}><Outlet /></div></div>
}
export default function EmpresaLayout() { return <EmpresaProvider><CompanyWorkspace /></EmpresaProvider> }
