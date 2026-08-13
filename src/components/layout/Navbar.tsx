import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-semibold">
          Emprega<span className="text-primary">Santana</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          {user && (
            <Link to="/empresas" className="hover:text-primary">
              Empresas
            </Link>
          )}
          <Link to="/explorar" className="hover:text-primary">
            Explorar
          </Link>
          {user && (
            <Link to="/perfil" className="hover:text-primary">
              Meu Perfil
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <Button asChild size="sm">
                <Link to="/login">Entrar</Link>
              </Button>
              <Link to="/cadastro" className="text-xs text-muted-foreground hover:text-primary">
                Criar conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
