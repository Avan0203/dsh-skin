/**
 * Host half of the background bundle.
 *
 * The browser cannot read `file://` paths on the Web GUI's http origin, so this
 * half does two things and nothing else:
 *
 * 1. It persists the wallpaper settings in `$DSH_HOME/data/dsh-skin/`
 *    (the Web GUI's origin changes with its port, so `localStorage` would not
 *    survive a restart).
 * 2. It serves the media files the settings point at, over a same-origin route,
 *    limited to the configured roots and to image/video extensions.
 *
 * Rendering lives entirely in `client.js`.
 */
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, extname, join, resolve, sep, basename } from 'node:path'

export const inject = ['webServer']

const ROUTE = '/plugin-skin'
const DATA_DIR = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'data', 'dsh-skin')
const CONFIG_FILE = join(DATA_DIR, 'config.json')
const LIBRARY_DIR = join(DATA_DIR, 'library')

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.jfif', '.webp', '.gif', '.avif', '.bmp', '.svg'])
const VIDEO_EXT = new Set(['.mp4', '.webm', '.ogv', '.mov', '.m4v'])

const CONTENT_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.mov': 'video/quicktime',
  '.m4v': 'video/mp4',
}

const DEFAULTS = {
  enabled: true,
  source: 'urls',
  urls: [],
  folders: [],
  files: [],
  hidden: [],
  cacheUrls: true,
  cacheDir: '',
  wallpaperDir: '',
  opacity: 100,
  blur: 0,
  surfaceOpacity: 62,
  intervalSec: 30,
  random: false,
  advanceOnEnd: true,
  videoMuted: true,
  fadeSec: 1.2,
}

const MAX_ITEMS = 4000
const MAX_WALK_DEPTH = 4
const MAX_REMOTE_BYTES = 64 * 1024 * 1024
const REMOTE_CACHE_DIR = 'url-cache'
const REMOTE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  accept: 'image/avif,image/webp,image/apng,image/*,video/*;q=0.9,*/*;q=0.8',
}

function clampNumber(value, min, max, fallback) {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number * 100) / 100))
}

function stringList(value, limit = 200) {
  if (!Array.isArray(value)) return []
  const out = []
  for (const entry of value) {
    if (typeof entry !== 'string') continue
    const trimmed = entry.trim()
    if (trimmed === '' || out.includes(trimmed)) continue
    out.push(trimmed)
    if (out.length >= limit) break
  }
  return out
}

function sanitize(input) {
  const source = input && typeof input === 'object' ? input : {}
  return {
    enabled: source.enabled === undefined ? DEFAULTS.enabled : Boolean(source.enabled),
    source: source.source === 'local' || source.source === 'wallpaper' ? source.source : 'urls',
    urls: stringList(source.urls, 100),
    folders: stringList(source.folders, 50),
    files: stringList(source.files, 200),
    hidden: stringList(source.hidden, 1000),
    cacheUrls: source.cacheUrls === undefined ? DEFAULTS.cacheUrls : Boolean(source.cacheUrls),
    cacheDir: typeof source.cacheDir === 'string' ? source.cacheDir.trim() : '',
    wallpaperDir: typeof source.wallpaperDir === 'string' ? source.wallpaperDir.trim() : '',
    opacity: clampNumber(source.opacity, 0, 100, DEFAULTS.opacity),
    blur: clampNumber(source.blur, 0, 80, DEFAULTS.blur),
    surfaceOpacity: clampNumber(source.surfaceOpacity, 0, 100, DEFAULTS.surfaceOpacity),
    intervalSec: clampNumber(source.intervalSec, 3, 86400, DEFAULTS.intervalSec),
    random: Boolean(source.random),
    advanceOnEnd: source.advanceOnEnd === undefined ? DEFAULTS.advanceOnEnd : Boolean(source.advanceOnEnd),
    videoMuted: source.videoMuted === undefined ? DEFAULTS.videoMuted : Boolean(source.videoMuted),
    fadeSec: clampNumber(source.fadeSec, 0, 5, DEFAULTS.fadeSec),
  }
}

async function loadConfig() {
  try {
    const text = await readFile(CONFIG_FILE, 'utf8')
    return sanitize(JSON.parse(text))
  } catch {
    return sanitize(DEFAULTS)
  }
}

async function persistConfig(config) {
  await mkdir(DATA_DIR, { recursive: true })
  const temporary = join(DATA_DIR, `config.${process.pid}.tmp`)
  await writeFile(temporary, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
  await rename(temporary, CONFIG_FILE)
}

function mediaKind(fileName) {
  const ext = extname(fileName).toLowerCase()
  if (IMAGE_EXT.has(ext)) return 'image'
  if (VIDEO_EXT.has(ext)) return 'video'
  return undefined
}

function mediaUrl(absolutePath) {
  return `${ROUTE}/media?path=${encodeURIComponent(absolutePath)}`
}

function effectiveCacheDir(config) {
  const value = typeof config.cacheDir === 'string' ? config.cacheDir.trim() : ''
  return value === '' ? LIBRARY_DIR : resolve(value)
}

function remoteUrl(value) {
  return `${ROUTE}/remote?url=${encodeURIComponent(value)}`
}

function extensionForType(type) {
  for (const [ext, value] of Object.entries(CONTENT_TYPES)) {
    if (value === type) return ext
  }
  return ''
}

function extensionForUrl(value) {
  try {
    const ext = extname(new URL(value).pathname).toLowerCase()
    return mediaKind(`file${ext}`) === undefined ? '' : ext
  } catch {
    return ''
  }
}

function remoteCacheKey(value) {
  return createHash('sha1').update(value).digest('hex').slice(0, 24)
}

async function findCachedMedia(directory, hash) {
  const target = join(directory, REMOTE_CACHE_DIR, hash)
  try {
    const entries = await readdir(target, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isFile() || mediaKind(entry.name) === undefined) continue
      return join(target, entry.name)
    }
  } catch {
    /* not cached yet */
  }
  return ''
}

async function downloadRemoteMedia(value, directory, hash) {
  const response = await fetch(value, {
    redirect: 'follow',
    headers: REMOTE_HEADERS,
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
  if (!type.startsWith('image/') && !type.startsWith('video/')) throw new Error('不是图片或视频')
  const ext = extensionForType(type) || extensionForUrl(value)
  if (ext === '') throw new Error('无法判断文件类型')
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length === 0) throw new Error('响应为空')
  if (buffer.length > MAX_REMOTE_BYTES) throw new Error('图片超过大小上限')
  const target = join(directory, REMOTE_CACHE_DIR, hash)
  await mkdir(target, { recursive: true })
  const file = join(target, `media${ext}`)
  const temporary = join(target, `media.${process.pid}.tmp`)
  await writeFile(temporary, buffer)
  await rename(temporary, file)
  return file
}

const remoteDownloads = new Map()

async function cacheRemoteMedia(value, directory) {
  const hash = remoteCacheKey(value)
  const hit = await findCachedMedia(directory, hash)
  if (hit !== '') return hit
  const key = `${directory}\n${hash}`
  const pending = remoteDownloads.get(key)
  if (pending !== undefined) return pending
  const task = downloadRemoteMedia(value, directory, hash)
  remoteDownloads.set(key, task)
  try {
    return await task
  } finally {
    remoteDownloads.delete(key)
  }
}

function samePath(a, b) {
  if (process.platform === 'win32') return a.toLowerCase() === b.toLowerCase()
  return a === b
}

function insideRoot(candidate, root) {
  if (samePath(candidate, root)) return true
  const prefix = root.endsWith(sep) ? root : `${root}${sep}`
  return process.platform === 'win32'
    ? candidate.toLowerCase().startsWith(prefix.toLowerCase())
    : candidate.startsWith(prefix)
}

function allowedRoots(config) {
  const roots = []
  const push = (value) => {
    if (typeof value !== 'string' || value.trim() === '') return
    roots.push(resolve(value.trim()))
  }
  if (config.source === 'local') {
    for (const folder of config.folders) push(folder)
    for (const file of config.files) push(dirname(resolve(file)))
  } else if (config.source === 'wallpaper') {
    push(config.wallpaperDir)
  }
  return roots
}

async function walk(directory, depth, items, errors) {
  if (depth > MAX_WALK_DEPTH || items.length >= MAX_ITEMS) return
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    errors.push(`无法读取目录 ${directory}: ${error.message}`)
    return
  }
  for (const entry of entries) {
    if (items.length >= MAX_ITEMS) return
    if (entry.name.startsWith('.')) continue
    const full = join(directory, entry.name)
    if (entry.isDirectory()) {
      await walk(full, depth + 1, items, errors)
      continue
    }
    if (!entry.isFile()) continue
    const kind = mediaKind(entry.name)
    if (kind === undefined) continue
    items.push({ src: mediaUrl(full), kind, label: full })
  }
}

async function describePath(target, items, errors) {
  const absolute = resolve(target)
  let info
  try {
    info = await stat(absolute)
  } catch {
    errors.push(`路径不存在: ${absolute}`)
    return
  }
  if (info.isDirectory()) {
    await walk(absolute, 0, items, errors)
    return
  }
  const kind = mediaKind(absolute)
  if (kind === undefined) {
    errors.push(`不支持的图片或视频格式: ${absolute}`)
    return
  }
  items.push({ src: mediaUrl(absolute), kind, label: absolute })
}

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value) || /^blob:/i.test(value) || /^data:image\//i.test(value)
}

function remoteKind(value) {
  const withoutQuery = value.split(/[?#]/)[0].toLowerCase()
  for (const ext of VIDEO_EXT) if (withoutQuery.endsWith(ext)) return 'video'
  return 'image'
}

function hiddenKeys(config) {
  const keys = new Set()
  for (const entry of config.hidden) {
    keys.add(process.platform === 'win32' ? entry.toLowerCase() : entry)
  }
  return keys
}

function isHidden(label, keys) {
  return keys.has(process.platform === 'win32' ? label.toLowerCase() : label)
}

async function buildPlaylist(config) {
  const items = []
  const errors = []
  const hidden = hiddenKeys(config)

  if (config.source === 'local') {
    for (const file of config.files) {
      await describePath(file, items, errors)
    }
    for (const folder of config.folders) {
      await describePath(folder, items, errors)
    }
  } else if (config.source === 'wallpaper') {
    if (config.wallpaperDir.trim() !== '') {
      await describePath(config.wallpaperDir, items, errors)
    }
  } else {
    for (const url of config.urls) {
      if (!isRemoteUrl(url)) {
        errors.push(`不是 http(s) 图片地址: ${url}`)
        continue
      }
      const cacheable = /^https?:\/\//i.test(url)
      items.push({
        src: config.cacheUrls && cacheable ? remoteUrl(url) : url,
        kind: remoteKind(url),
        label: url,
      })
    }
  }

  const unique = []
  const seenSrc = new Set()
  for (const item of items) {
    if (isHidden(item.label, hidden)) continue
    if (seenSrc.has(item.src)) continue
    seenSrc.add(item.src)
    unique.push(item)
  }
  return { items: unique, errors }
}

function sendJson(response, status, value) {
  const body = JSON.stringify(value)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  response.end(body)
}

function pipeFile(filePath, options, response) {
  const stream = createReadStream(filePath, options)
  stream.on('error', () => {
    response.destroy()
  })
  stream.pipe(response)
}

async function serveMediaFile(absolute, request, response) {
  if (mediaKind(absolute) === undefined) {
    sendJson(response, 415, { error: '不支持的媒体格式' })
    return
  }
  let info
  try {
    info = await stat(absolute)
  } catch {
    sendJson(response, 404, { error: '文件不存在' })
    return
  }
  if (!info.isFile()) {
    sendJson(response, 404, { error: '不是文件' })
    return
  }
  const contentType = CONTENT_TYPES[extname(absolute).toLowerCase()] || 'application/octet-stream'
  const range = request.headers.range
  if (typeof range === 'string') {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim())
    if (match !== null) {
      const start = match[1] === '' ? 0 : Number(match[1])
      const end = match[2] === '' ? info.size - 1 : Math.min(Number(match[2]), info.size - 1)
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= info.size) {
        response.writeHead(416, { 'content-range': `bytes */${info.size}` })
        response.end()
        return
      }
      response.writeHead(206, {
        'content-type': contentType,
        'content-length': end - start + 1,
        'content-range': `bytes ${start}-${end}/${info.size}`,
        'accept-ranges': 'bytes',
        'cache-control': 'private, max-age=3600',
      })
      pipeFile(absolute, { start, end }, response)
      return
    }
  }
  response.writeHead(200, {
    'content-type': contentType,
    'content-length': info.size,
    'accept-ranges': 'bytes',
    'cache-control': 'private, max-age=3600',
  })
  if (request.method === 'HEAD') {
    response.end()
    return
  }
  pipeFile(absolute, undefined, response)
}

function readBody(request, limit = 512 * 1024) {
  return new Promise((resolvePromise, reject) => {
    const chunks = []
    let size = 0
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('请求内容过大'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolvePromise(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })
}

function readBinary(request, limit) {
  return new Promise((resolvePromise, reject) => {
    const chunks = []
    let size = 0
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('文件超过大小上限'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolvePromise(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

export function apply(ctx) {
  let config = sanitize(DEFAULTS)
  let cachedKey = ''
  let cachedPlaylist = { items: [], errors: [] }
  let ready = loadConfig().then((loaded) => {
    config = loaded
    return config
  })

  const refresh = async (force) => {
    const key = JSON.stringify(config)
    if (!force && key === cachedKey) return cachedPlaylist
    cachedPlaylist = await buildPlaylist(config)
    cachedKey = key
    return cachedPlaylist
  }

  ctx.effect(() => {
    const disposer = ctx.webServer.register({
      kind: 'prefix',
      path: ROUTE,
      handler: async (request, response) => {
        try {
          const url = new URL(request.url || ROUTE, 'http://127.0.0.1')
          const route = url.pathname.slice(ROUTE.length).replace(/\/+$/, '') || '/'
          await ready

          if (route === '/upload' && request.method === 'POST') {
            const name = url.searchParams.get('name') || 'file'
            const safe = basename(name).replace(/[^\w.\- ]+/g, '_').slice(-80)
            if (safe === '' || mediaKind(safe) === undefined) {
              sendJson(response, 415, { error: '不支持的媒体格式' })
              return
            }
            const data = await readBinary(request, 64 * 1024 * 1024)
            const directory = effectiveCacheDir(config)
            await mkdir(directory, { recursive: true })
            const target = join(directory, `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}-${safe}`)
            await writeFile(target, data)
            sendJson(response, 200, { path: target })
            return
          }

          if (route === '/state' && request.method === 'GET') {
            const playlist = await refresh(url.searchParams.get('refresh') === '1')
            sendJson(response, 200, { config, playlist, defaultCacheDir: LIBRARY_DIR })
            return
          }

          if (route === '/remote' && (request.method === 'GET' || request.method === 'HEAD')) {
            const source = url.searchParams.get('url')
            if (!source) {
              sendJson(response, 400, { error: '缺少 url' })
              return
            }
            if (!/^https?:\/\//i.test(source)) {
              sendJson(response, 400, { error: '不是 http(s) 图片地址' })
              return
            }
            if (!config.cacheUrls) {
              response.writeHead(302, { location: source })
              response.end()
              return
            }
            let file = ''
            try {
              file = await cacheRemoteMedia(source, effectiveCacheDir(config))
            } catch {
              // A failing cache must not hide the wallpaper: let the browser
              // load the original URL directly instead.
              response.writeHead(302, { location: source })
              response.end()
              return
            }
            await serveMediaFile(file, request, response)
            return
          }

          if (route === '/config' && request.method === 'POST') {
            const text = await readBody(request)
            let parsed
            try {
              parsed = JSON.parse(text)
            } catch {
              sendJson(response, 400, { error: '配置不是合法 JSON' })
              return
            }
            config = sanitize(parsed)
            await persistConfig(config)
            const playlist = await refresh(true)
            sendJson(response, 200, { config, playlist })
            return
          }

          if (route === '/media' && (request.method === 'GET' || request.method === 'HEAD')) {
            const target = url.searchParams.get('path')
            if (!target) {
              sendJson(response, 400, { error: '缺少 path' })
              return
            }
            const absolute = resolve(target)
            const allowed = allowedRoots(config).some((root) => insideRoot(absolute, root))
            if (!allowed) {
              sendJson(response, 403, { error: '路径不在已配置的背景来源中' })
              return
            }
            await serveMediaFile(absolute, request, response)
            return
          }

          sendJson(response, 404, { error: '未知接口' })
        } catch (error) {
          try {
            sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) })
          } catch {
            /* the socket may already be gone */
          }
        }
      },
    })
    return disposer
  })
}
