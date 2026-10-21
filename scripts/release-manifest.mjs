import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Hash only deploy inputs. Environment files and credentials are never read.
async function inputFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async entry => {
    const name = path.posix.join(directory, entry.name)
    return entry.isDirectory() ? inputFiles(name) : [name]
  }))
  return files.flat()
}

export async function releaseFingerprint() {
  const files = ['index.html', 'package.json', 'package-lock.json', 'vite.config.ts', 'vercel.json', 'middleware.ts',
    ...await inputFiles('src'), ...await inputFiles('public'), ...await inputFiles('supabase/migrations'), ...await inputFiles('scripts')]
  const hash = createHash('sha256')
  for (const name of files.sort()) {
    hash.update(name).update('\0').update(await readFile(name)).update('\0')
  }
  return hash.digest('hex')
}

let commit = process.env.VERCEL_GIT_COMMIT_SHA ?? null
let localChanges = null
try {
  commit ??= execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  localChanges = Boolean(execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], { encoding: 'utf8' }).trim())
} catch { /* Uploaded source archives may have no Git metadata. */ }

const manifest = {
  application: 'empregasantana',
  release: 'admin-wordpress-2026-10',
  commit,
  localChanges,
  sourceFingerprint: await releaseFingerprint(),
  builtAt: new Date().toISOString(),
  requiredMigrations: ['0021_blog_articles.sql', '0022_site_appearance.sql', '0023_restrict_admin_access.sql'],
}
await writeFile('dist/version.json', `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Release ${manifest.release}: ${manifest.sourceFingerprint.slice(0, 12)}${localChanges ? ' (alterações locais presentes)' : ''}`)
