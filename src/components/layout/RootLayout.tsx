import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        EmpregaSantana — {new Date().getFullYear()}
      </footer>
    </div>
  )
}
