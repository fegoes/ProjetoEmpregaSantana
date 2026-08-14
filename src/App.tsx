import { Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

import HomePage from '@/pages/public/HomePage'
import VagaDetailPage from '@/pages/public/VagaDetailPage'
import AutonomoDetailPage from '@/pages/public/AutonomoDetailPage'
import EmpresaDetailPagePublic from '@/pages/public/EmpresaDetailPage'
import ExplorarPage from '@/pages/public/ExplorarPage'
import PlanosPage from '@/pages/public/PlanosPage'
import LoginPage from '@/pages/public/LoginPage'
import CadastroPage from '@/pages/public/CadastroPage'
import CadastroConfirmarPage from '@/pages/public/CadastroConfirmarPage'
import { SobrePage, TermosPage, PrivacidadePage, LgpdPage } from '@/pages/public/StaticPage'

import EmpresasDirectoryPage from '@/pages/shared/EmpresasDirectoryPage'
import PerfilPage from '@/pages/shared/PerfilPage'
import PerfilContaPage from '@/pages/shared/PerfilContaPage'

import CandidatoOnboardingPage from '@/pages/candidato/OnboardingPage'
import CvListPage from '@/pages/candidato/CvListPage'
import CvEditPage from '@/pages/candidato/CvEditPage'
import CandidaturasPage from '@/pages/candidato/CandidaturasPage'

import AutonomoOnboardingPage from '@/pages/autonomo/OnboardingPage'
import AutonomoPerfilPage from '@/pages/autonomo/PerfilPage'
import AutonomoPlanoPage from '@/pages/autonomo/PlanoPage'

import EmpresaLayout from '@/pages/empresa/EmpresaLayout'
import EmpresaOnboardingPage from '@/pages/empresa/OnboardingPage'
import EmpresaPainelPage from '@/pages/empresa/PainelPage'
import EmpresaVagasListPage from '@/pages/empresa/VagasListPage'
import VagaFormPage from '@/pages/empresa/VagaFormPage'
import VagaCandidatosPage from '@/pages/empresa/VagaCandidatosPage'
import EmpresaPerfilPage from '@/pages/empresa/PerfilPage'
import EmpresaPlanoPage from '@/pages/empresa/PlanoPage'
import BancoCurriculosPage from '@/pages/empresa/BancoCurriculosPage'

import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboardPage from '@/pages/admin/DashboardPage'
import AdminEmpresasPage from '@/pages/admin/EmpresasPage'
import AdminEmpresaDetailPage from '@/pages/admin/EmpresaDetailPage'
import AdminUsuariosPage from '@/pages/admin/UsuariosPage'
import AdminPlanosPage from '@/pages/admin/PlanosPage'
import AdminVagasPage from '@/pages/admin/VagasPage'
import AdminAdsPage from '@/pages/admin/AdsPage'
import AdminPaginasPage from '@/pages/admin/PaginasPage'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Públicas */}
        <Route index element={<HomePage />} />
        <Route path="vagas/:id" element={<VagaDetailPage />} />
        <Route path="autonomos/:id" element={<AutonomoDetailPage />} />
        <Route path="empresas/:id" element={<EmpresaDetailPagePublic />} />
        <Route path="explorar" element={<ExplorarPage />} />
        <Route path="planos" element={<PlanosPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="cadastro" element={<CadastroPage />} />
        <Route path="cadastro/confirmar" element={<CadastroConfirmarPage />} />
        <Route path="sobre" element={<SobrePage />} />
        <Route path="termos" element={<TermosPage />} />
        <Route path="privacidade" element={<PrivacidadePage />} />
        <Route path="lgpd" element={<LgpdPage />} />

        {/* Autenticadas — comum */}
        <Route element={<ProtectedRoute />}>
          <Route path="empresas" element={<EmpresasDirectoryPage />} />
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="perfil/conta" element={<PerfilContaPage />} />
        </Route>

        {/* Candidato */}
        <Route element={<ProtectedRoute />}>
          <Route path="candidato/onboarding" element={<CandidatoOnboardingPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['candidato']} />}>
          <Route path="candidato/cv" element={<CvListPage />} />
          <Route path="candidato/cv/:id" element={<CvEditPage />} />
          <Route path="candidato/candidaturas" element={<CandidaturasPage />} />
        </Route>

        {/* Autônomo */}
        <Route element={<ProtectedRoute />}>
          <Route path="autonomo/onboarding" element={<AutonomoOnboardingPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['autonomo']} />}>
          <Route path="autonomo/perfil" element={<AutonomoPerfilPage />} />
          <Route path="autonomo/plano" element={<AutonomoPlanoPage />} />
        </Route>

        {/* Empresa */}
        <Route element={<ProtectedRoute />}>
          <Route path="empresa/onboarding" element={<EmpresaOnboardingPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['empresa_owner']} />}>
          <Route element={<EmpresaLayout />}>
            <Route path="empresa/painel" element={<EmpresaPainelPage />} />
            <Route path="empresa/vagas" element={<EmpresaVagasListPage />} />
            <Route path="empresa/vagas/nova" element={<VagaFormPage />} />
            <Route path="empresa/vagas/:id/editar" element={<VagaFormPage />} />
            <Route path="empresa/vagas/:id/candidatos" element={<VagaCandidatosPage />} />
            <Route path="empresa/perfil" element={<EmpresaPerfilPage />} />
            <Route path="empresa/plano" element={<EmpresaPlanoPage />} />
            <Route path="empresa/banco-de-curriculos" element={<BancoCurriculosPage />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/empresas" element={<AdminEmpresasPage />} />
            <Route path="admin/empresas/:id" element={<AdminEmpresaDetailPage />} />
            <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
            <Route path="admin/planos" element={<AdminPlanosPage />} />
            <Route path="admin/vagas" element={<AdminVagasPage />} />
            <Route path="admin/paginas" element={<AdminPaginasPage />} />
            <Route path="admin/ads" element={<AdminAdsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
