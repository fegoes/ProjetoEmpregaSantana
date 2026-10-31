// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { remoteImageFile } from './remoteImage'
afterEach(()=>vi.unstubAllGlobals())
describe('importação remota de imagem',()=>{
 it('identifica PNG pelo conteúdo, sem depender da extensão do endereço',async()=>{const fetch=vi.fn().mockResolvedValue(new Response(new Uint8Array([137,80,78,71,13,10,26,10])));vi.stubGlobal('fetch',fetch);const file=await remoteImageFile('https://example.test/image?id=1');expect(file.type).toBe('image/png');expect(fetch).toHaveBeenCalledWith('https://example.test/image?id=1',expect.objectContaining({credentials:'omit',mode:'cors'}))})
 it('recusa protocolos e credenciais antes de acessar o endereço',async()=>{const fetch=vi.fn();vi.stubGlobal('fetch',fetch);await expect(remoteImageFile('http://example.test/image.jpg')).rejects.toThrow('HTTPS');await expect(remoteImageFile('https://user:password@example.test/image.jpg')).rejects.toThrow('sem usuário');expect(fetch).not.toHaveBeenCalled()})
 it('recusa página HTML disfarçada de imagem',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('<html>login</html>',{headers:{'content-type':'image/jpeg'}})));await expect(remoteImageFile('https://example.test/image.jpg')).rejects.toThrow('não uma página')})
 it('limita o download mesmo sem content-length',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(new Uint8Array(5*1024*1024+1))));await expect(remoteImageFile('https://example.test/large.png')).rejects.toThrow('5 MB')})
 it('explica bloqueio de importação e oferece o envio local',async()=>{vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));await expect(remoteImageFile('https://example.test/image.jpg')).rejects.toThrow('Enviar arquivo')})
})
