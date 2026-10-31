/** Importação no navegador, sem enviar cookies ao servidor externo. */
export async function remoteImageFile(value: string): Promise<File> {
 let url:URL
 try{url=new URL(value)}catch{throw new Error('Informe um link HTTPS válido para a imagem.')}
 if(url.protocol!=='https:'||url.username||url.password)throw new Error('Use um link HTTPS público, sem usuário ou senha no endereço.')
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000)
 try{
  const response=await fetch(url.href,{mode:'cors',credentials:'omit',signal:controller.signal})
  if(!response.ok||!response.body)throw new Error('Não foi possível baixar a imagem desse link.')
  const limit=5*1024*1024
  if(Number(response.headers.get('content-length'))>limit){await response.body.cancel();throw new Error('A imagem deve ter até 5 MB.')}
  const reader=response.body.getReader(),parts:Uint8Array<ArrayBuffer>[]=[];let size=0
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new Error('A imagem deve ter até 5 MB.')}parts.push(new Uint8Array(value))}
  const blob=new Blob(parts),bytes=new Uint8Array(await blob.slice(0,8).arrayBuffer())
  const png=bytes.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)
  const jpg=bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255
  if(!png&&!jpg)throw new Error('O link precisa retornar uma imagem JPG ou PNG, não uma página de site.')
  return new File([blob],png?'imagem-importada.png':'imagem-importada.jpg',{type:png?'image/png':'image/jpeg'})
 }catch(error){if(error instanceof TypeError||controller.signal.aborted)throw new Error('O servidor não permitiu importar a imagem ou demorou a responder. Baixe a imagem e use “Enviar arquivo”.');throw error}finally{clearTimeout(timer)}
}
