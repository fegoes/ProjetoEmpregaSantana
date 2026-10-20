import { MessageCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ShareWhatsAppButtonProps {
  text: string
  url?: string
  label?: string
  iconOnly?: boolean
  className?: string
}

/** Abre o WhatsApp com a mensagem pronta — é por onde as vagas circulam na região. */
export function ShareWhatsAppButton({ text, url, label = 'Enviar no WhatsApp', iconOnly = false, className }: ShareWhatsAppButtonProps) {
  const link = typeof window !== 'undefined' ? (url ?? window.location.href) : (url ?? '')
  const href = `https://wa.me/?text=${encodeURIComponent(`${text}\n${link}`)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={iconOnly ? label : undefined}
      className={cn(buttonVariants({ variant: 'outline', size: iconOnly ? 'icon' : 'default' }), 'shrink-0', className)}
    >
      <MessageCircle />
      {!iconOnly && label}
    </a>
  )
}
