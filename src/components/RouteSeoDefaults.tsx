import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
export function RouteSeoDefaults() {
 const {pathname}=useLocation()
 useLayoutEffect(()=>{
  const privatePage=/^\/(admin|perfil|candidato|autonomo|empresa|login|cadastro|redefinir-senha|esqueci-senha)(\/|$)/.test(pathname)||pathname==='/empresas'
  const meta=(attr:string,key:string,value:string)=>{let tag=document.querySelector(`meta[${attr}="${key}"]`);if(!tag){tag=document.createElement('meta');tag.setAttribute(attr,key);document.head.appendChild(tag)}tag.setAttribute('content',value)}
  document.title='EmpregaSantana — trabalho e serviços na sua região'
  const description='Encontre oportunidades de trabalho e profissionais em Santana do Ipanema e região.'
  meta('name','robots',privatePage?'noindex, nofollow':'index, follow')
  meta('name','description',description);meta('name','keywords','')
  for(const prefix of ['og','twitter']){
   const attr=prefix==='og'?'property':'name'
   meta(attr,`${prefix}:title`,'EmpregaSantana');meta(attr,`${prefix}:description`,description);meta(attr,`${prefix}:image`,new URL('/og-image.png',location.origin).href);meta(attr,`${prefix}:image:alt`,'EmpregaSantana')
  }
  meta('property','og:type','website');meta('property','og:url',new URL(pathname,location.origin).href)
  let canonical=document.querySelector<HTMLLinkElement>('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)}canonical.href=new URL(pathname,location.origin).href
 },[pathname])
 return null
}
