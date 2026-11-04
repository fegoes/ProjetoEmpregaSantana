import { expect, it } from 'vitest'
import { directPostVideo, validatePostVideo, VIDEO_LIMIT } from './videoFormats'
it('aceita MP4/WebM limitados e recusa outros formatos e excesso de tamanho',()=>{
 expect(()=>validatePostVideo(new File(['video'],'x.mp4',{type:'video/mp4'}))).not.toThrow()
 expect(()=>validatePostVideo(new File(['svg'],'x.svg',{type:'image/svg+xml'}))).toThrow('MP4 ou WebM')
 const large=new File(['video'],'x.webm',{type:'video/webm'});Object.defineProperty(large,'size',{value:VIDEO_LIMIT+1})
 expect(()=>validatePostVideo(large)).toThrow('50 MB')
})
it('links diretos exigem HTTPS sem credenciais e extensão de vídeo',()=>{
 expect(directPostVideo('https://example.test/video.mp4?version=2')).toContain('video.mp4')
 expect(directPostVideo('http://example.test/video.mp4')).toBeNull()
 expect(directPostVideo('https://user:pass@example.test/video.mp4')).toBeNull()
 expect(directPostVideo('https://example.test/foto.jpg')).toBeNull()
 expect(directPostVideo('javascript:alert(1)')).toBeNull()
})
