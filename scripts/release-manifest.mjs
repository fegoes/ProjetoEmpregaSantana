import { execFileSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { releaseFingerprint } from './release-inputs.mjs'

let commit = process.env.VERCEL_GIT_COMMIT_SHA ?? null
let localChanges = null
try {
  commit ??= execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  localChanges = Boolean(execFileSync('git', ['status', '--porcelain', '--untracked-files=normal', '--', 'src', 'public', 'scripts', 'supabase/migrations', 'package.json', 'package-lock.json', 'vite.config.ts', 'vercel.json', 'middleware.ts', 'index.html'], { encoding: 'utf8' }).trim())
} catch { /* Uploaded source archives may have no Git metadata. */ }

const manifest = {
  application: 'empregasantana',
  release: 'admin-wordpress-2026-10',
  commit,
  localChanges,
  sourceFingerprint: await releaseFingerprint(),
  builtAt: new Date().toISOString(),
  requiredMigrations: ['0021_blog_articles.sql', '0022_site_appearance.sql', '0023_restrict_admin_access.sql', '0024_admin_taxonomies.sql', '0025_article_seo.sql', '0026_password_admin_audit.sql'],
}
await writeFile('dist/version.json', `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Release ${manifest.release}: ${manifest.sourceFingerprint.slice(0, 12)}${localChanges ? ' (alterações locais presentes)' : ''}`)
