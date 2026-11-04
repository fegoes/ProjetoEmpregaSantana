export const VIDEO_LIMIT = 50 * 1024 * 1024
export function validatePostVideo(file: File) {
 if (!['video/mp4','video/webm'].includes(file.type) || file.size > VIDEO_LIMIT) throw new Error('Use MP4 ou WebM, até 50 MB.')
}
/** Vídeo direto é reproduzido pelo navegador; provedores usam postVideo. */
export function directPostVideo(value: string): string | null {
 try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && /\.(mp4|webm)$/i.test(url.pathname) ? url.href : null } catch { return null }
}
