import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

const HomePage = lazy(() => import('@/pages/public/HomePage'))
const VagaDetailPage = lazy(() => import('@/pages/public/VagaDetailPage'))
const AutonomoDetailPage = lazy(() => import('@/pages/public/AutonomoDetailPage'))
const EmpresaDetailPagePublic = lazy(() => import('@/pages/public/EmpresaDetailPage'))
const ExplorarPage = lazy(() => import('@/pages/public/ExplorarPage'))
const PlanosPage = lazy(() => import('@/pages/public/PlanosPage'))
const LoginPage = lazy(() => import('@/pages/public/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/public/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/public/ResetPasswordPage'))
const CadastroPage = lazy(() => import('@/pages/public/CadastroPage'))
const CadastroConfirmarPage = lazy(() => import('@/pages/public/CadastroConfirmarPage'))
const SobrePage = lazy(() => import('@/pages/public/StaticPage').then((m) => ({ default: m.SobrePage })))
const TermosPage = lazy(() => import('@/pages/public/StaticPage').then((m) => ({ default: m.TermosPage })))
const PrivacidadePage = lazy(() => import('@/pages/public/StaticPage').then((m) => ({ default: m.PrivacidadePage })))
const LgpdPage = lazy(() => import('@/pages/public/StaticPage').then((m) => ({ default: m.LgpdPage })))

const EmpresasDirectoryPage = lazy(() => import('@/pages/shared/EmpresasDirectoryPage'))
const PerfilPage = lazy(() => import('@/pages/shared/PerfilPage'))
const PerfilContaPage = lazy(() => import('@/pages/shared/PerfilContaPage'))

const CandidatoOnboardingPage = lazy(() => import('@/pages/candidato/OnboardingPage'))
const CvListPage = lazy(() => import('@/pages/candidato/CvListPage'))
const CvEditPage = lazy(() => import('@/pages/candidato/CvEditPage'))
const CandidaturasPage = lazy(() => import('@/pages/candidato/CandidaturasPage'))

const AutonomoOnboardingPage = lazy(() => import('@/pages/autonomo/OnboardingPage'))
const AutonomoPerfilPage = lazy(() => import('@/pages/autonomo/PerfilPage'))
const AutonomoPlanoPage = lazy(() => import('@/pages/autonomo/PlanoPage'))

const EmpresaLayout = lazy(() => import('@/pages/empresa/EmpresaLayout'))
const EmpresaOnboardingPage = lazy(() => import('@/pages/empresa/OnboardingPage'))
const EmpresaPainelPage = lazy(() => import('@/pages/empresa/PainelPage'))
const EmpresaVagasListPage = lazy(() => import('@/pages/empresa/VagasListPage'))
const VagaFormPage = lazy(() => import('@/pages/empresa/VagaFormPage'))
const VagaCandidatosPage = lazy(() => import('@/pages/empresa/VagaCandidatosPage'))
const EmpresaPerfilPage = lazy(() => import('@/pages/empresa/PerfilPage'))
const EmpresaPlanoPage = lazy(() => import('@/pages/empresa/PlanoPage'))
const BancoCurriculosPage = lazy(() => import('@/pages/empresa/BancoCurriculosPage'))

const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminEmpresasPage = lazy(() => import('@/pages/admin/EmpresasPage'))
const AdminEmpresaDetailPage = lazy(() => import('@/pages/admin/EmpresaDetailPage'))
const AdminUsuariosPage = lazy(() => import('@/pages/admin/UsuariosPage'))
const AdminPlanosPage = lazy(() => import('@/pages/admin/PlanosPage'))
const AdminVagasPage = lazy(() => import('@/pages/admin/VagasPage'))
const AdminAdsPage = lazy(() => import('@/pages/admin/AdsPage'))
const AdminPaginasPage = lazy(() => import('@/pages/admin/PaginasPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
          <Route path="esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="redefinir-senha" element={<ResetPasswordPage />} />
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
    </Suspense>
  )
}
