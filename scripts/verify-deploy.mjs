import { readFile } from 'node:fs/promises'
import { releaseFingerprint } from './release-inputs.mjs'

try {
  const target = process.argv[2]
  if (!target) throw new Error('Informe a URL: npm run verify:deploy -- https://seu-site.vercel.app')
  const url = new URL('/version.json', target)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use uma URL HTTP ou HTTPS.')
  url.searchParams.set('check', String(Date.now()))
  const expected = JSON.parse(await readFile('dist/version.json', 'utf8'))
  if (expected.sourceFingerprint !== await releaseFingerprint()) throw new Error('O build local está desatualizado. Execute npm run build antes de comparar o deploy.')
  const response = await fetch(url, { headers: { 'cache-control': 'no-cache' }, signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error(`A versão publicada respondeu HTTP ${response.status}.`)
  let actual
  try { actual = await response.json() } catch { throw new Error('O deploy não fornece version.json. Pode ser uma versão anterior ou uma saída de build incorreta.') }
  if (actual.application !== expected.application || actual.sourceFingerprint !== expected.sourceFingerprint) {
    throw new Error(`O deploy difere do build local. Local: ${expected.sourceFingerprint.slice(0, 12)}; publicado: ${actual.sourceFingerprint?.slice(0, 12) ?? 'sem identificação'}.`)
  }
  console.log(`Deploy corresponde ao build local: ${actual.release} (${actual.sourceFingerprint.slice(0, 12)}).`)
  console.log('Esta conferência verifica a versão do frontend; migrations e permissões do Supabase precisam de validação própria.')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
