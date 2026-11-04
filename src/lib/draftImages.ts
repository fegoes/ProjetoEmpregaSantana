import { validatePostVideo } from './videoFormats'
import { remoteImageFile } from './remoteImage'
import { IMAGE_MIME_TYPES } from './imageFormats'
export function validateDraftImage(file: File) {
  if (!IMAGE_MIME_TYPES.includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Use somente JPG ou PNG, até 5 MB.')
}
const escaped = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
/** Arquivos permanecem locais; cache evita duplicar uploads quando o salvamento é repetido. */
export class DraftImageStore {
  private pending = new Map<string, File | string>()
  private uploaded = new Map<string, string>()
  private videos = new Set<string>()
  readonly variants = new Map<string, string | null>()
  stageFile(file: File): string { validateDraftImage(file); const ref = URL.createObjectURL(file); this.pending.set(ref, file); return ref }
  stageVideo(file: File): string { validatePostVideo(file); const ref = URL.createObjectURL(file); this.pending.set(ref, file); this.videos.add(ref); return ref }
  isVideo(ref: string): boolean { return this.videos.has(ref) }
  stageLink(value: string): string {
    if (!value) return ''
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use um link HTTPS público, sem usuário ou senha.')
    this.pending.set(url.href, url.href); return url.href
  }
  isLocal(ref: string): boolean { return this.pending.get(ref) instanceof File }
  localRefs(): string[] { return [...this.pending.keys()].filter(ref => this.isLocal(ref)) }
  setVariant(desktop: string, mobile: string | null) { this.variants.set(desktop, mobile) }
  async prepare<T>(value: T, upload: (file: File) => Promise<string>, saveVariant: (desktop: string, mobile: string | null) => Promise<void>, uploadVideo?: (file: File) => Promise<string>): Promise<T> {
    let serialized = JSON.stringify(value)
    const used = (ref: string) => serialized.includes(ref) || serialized.includes(escaped(ref))
    const active = new Set([...this.pending.keys()].filter(used))
    const variants = [...this.variants].filter(([desktop]) => used(desktop))
    for (const [, mobile] of variants) if (mobile && this.pending.has(mobile)) active.add(mobile)
    for (const ref of active) {
      if (this.uploaded.has(ref)) continue
      const source = this.pending.get(ref)!
      const file = typeof source === 'string' ? await remoteImageFile(source) : source
      if (this.videos.has(ref)) {
        validatePostVideo(file)
        if (!uploadVideo) throw new Error('O envio de vídeos não está configurado.')
        this.uploaded.set(ref, await uploadVideo(file))
      } else { validateDraftImage(file); this.uploaded.set(ref, await upload(file)) }
    }
    for (const [desktop, mobile] of variants) await saveVariant(this.uploaded.get(desktop) ?? desktop, mobile ? this.uploaded.get(mobile) ?? mobile : null)
    for (const ref of active) {
      const target = this.uploaded.get(ref)!
      serialized = serialized.replaceAll(escaped(ref), escaped(target)).replaceAll(ref, target)
    }
    return JSON.parse(serialized) as T
  }
  dispose() { for (const ref of this.localRefs()) URL.revokeObjectURL(ref); this.pending.clear(); this.uploaded.clear(); this.variants.clear(); this.videos.clear() }
}
