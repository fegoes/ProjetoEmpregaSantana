import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
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
