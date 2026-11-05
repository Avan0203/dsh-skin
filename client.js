/**
 * Client half of the background bundle.
 *
 * It owns one fixed wallpaper layer behind the application frame, the playback
 * loop (interval / random), and the Settings page that edits the playlist and
 * the visual parameters. Settings are persisted by the Host half.
 */
window.__ModuleLoader__.load({
  id: 'dsh-skin-bg',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { Button: UiButton, Switch } = require('@deepseek-ai/dsh-client-ui-primitives')
    const NS = 'dsh-skin-bg'
    const API = '/plugin-skin'

    const ZH = {
      title: '背景壁纸',
      description: '为界面铺一层壁纸：网络图床、本地图片、Wallpaper Engine 下载目录。',
      loading: '正在读取背景设置…',
      sourceGroup: '图片来源',
      sourceHint: '三种来源只使用当前选中的一种，切换后立即重新加载。',
      tabUrls: '图床链接',
      tabLocal: '本地图片',
      tabWe: 'Wallpaper Engine',
      urlsRandomNote: '图床每次请求可能返回不同的图片，因此按顺序轮播；随机播放只对本地图片和壁纸库有效。',
      urlsCachedNote: '图床图片会按地址存档：每次切到这张图床图都会重新取一张，旧图留在「已加载图片」里，重启后仍在。',
      urlsTitle: '图床地址',
      urlsDesc: '每行一个图片直链（https://…），也可以直接粘贴 GIF 或视频直链。',
      urlsPlaceholder: 'https://example.com/wallpaper.jpg',
      cacheUrlsTitle: '缓存图床图片到本地',
      cacheUrlsDesc: '开启后，每次切到这张图床图都会重新下载并缓存一张，旧图不会被覆盖；关闭后每次都直接请求图床，不写缓存。',
      cacheDirTitle: '缓存目录',
      cacheDirDesc: '「选择文件夹」导入的本地图片和缓存的图床图片都存放在这里，留空使用默认目录。',
      cacheDirPlaceholder: '.dsh/data/dsh-skin/library',
      pickCacheDir: '选择目录',
      resetCacheDir: '恢复默认',
      cacheDirEffective: '当前使用：',
      cacheRestartNote: '缓存目录和图床缓存由 Host 进程读取，重启 DSH 后生效。',
      localTitle: '本地图片与文件夹',
      localDesc: '添加单个图片文件或整个图片目录，文件由本机插件进程读取，浏览器不需要文件访问权限。',
      localPlaceholder: '例如 D:\\Pictures\\wallpaper.jpg',
      addPath: '添加',
      pickFolder: '选择文件夹',
      folderHint: '「选择文件夹」会把其中的图片/视频复制到下方设置的缓存目录（默认 .dsh/data/dsh-skin/library），原文件不受影响；也可以填入文件夹路径后点「添加」。',
      galleryTitle: '已加载图片',
      galleryHint: '点击图片立即切换；鼠标悬停后点右上角的 × 可删除这张图片。图床缓存会一直保留，重启后还在。',
      cachedItem: '图床缓存',
      deleteImage: '删除这张图片',
      clearAll: '清空',
      clearConfirm: '确认清空？',
      galleryEmpty: '还没有加载到图片，先在上方添加来源。',
      importing: '正在导入',
      importEmpty: '所选文件夹里没有可用的图片或视频。',
      importFailed: '导入失败：',
      importCapped: '一次最多导入 200 个文件，多余的已跳过。',
      pickerTimeout: '系统目录选择器没有响应，请直接把路径粘贴到输入框。',
      pickerFailed: '系统目录选择器不可用，请直接粘贴路径：',
      weTitle: 'Wallpaper Engine',
      weDesc: '填写创意工坊 431960 目录，或某个已下载壁纸的文件夹；其中的图片与视频会被扫描出来。',
      wePlaceholder: '例如 D:\\Steam\\steamapps\\workshop\\content\\431960',
      pickWe: '选择目录',
      refresh: '重新扫描',
      appearanceGroup: '外观',
      opacityTitle: '背景图透明度',
      opacityDesc: '壁纸本身的浓淡，0 时只剩主题底色。',
      surfaceTitle: '界面不透明度',
      surfaceDesc: '主界面面板与侧边栏的遮挡程度，越低壁纸越明显；100 时主界面完全不透明。设置等弹窗始终保持不透明。',
      blurTitle: '模糊程度',
      blurDesc: '对壁纸做高斯模糊，不模糊界面本身。',
      playGroup: '播放',
      intervalTitle: '轮播间隔',
      intervalDesc: '自动切换到下一张的秒数；只有一张时，会按这个间隔重新请求这张图。',
      advanceOnEndTitle: '视频播完自动切换',
      advanceOnEndDesc: '视频不循环，播完就切到下一张；关闭时视频会一直循环，改由轮播间隔控制。',
      videoMutedTitle: '视频默认静音',
      videoMutedDesc: '视频以静音播放；关闭后带声音播放，若浏览器拦截自动播放会自动回退为静音。',
      shortcutHint: '快捷键：上一张 / 下一张。改键入口在 设置 → 通用 → 快捷键（右侧「编辑快捷键」），或直接按 Ctrl + /（Mac 为 ⌘ + /）打开速查。',
      shortcutNext: '下一张壁纸',
      shortcutPrev: '上一张壁纸',
      shortcutError: '快捷键注册失败：',
      randomTitle: '随机播放',
      randomDesc: '每次从列表中随机选择一张，而不是按顺序。',
      fadeTitle: '切换淡入淡出',
      fadeDesc: '两张壁纸交叉淡入淡出的时长。',
      next: '下一张',
      prev: '上一张',
      pause: '暂停轮播',
      resume: '继续轮播',
      enableTitle: '启用背景',
      enableDesc: '关闭后立即移除壁纸层，界面恢复原样。',
      statusLoaded: '已载入壁纸',
      statusNone: '还没有可用的壁纸，请添加来源。',
      statusSaving: '保存中…',
      statusPaused: '已暂停',
      currentItem: '当前',
      loadFailed: '这张没能加载，已保留上一张：',
      onlyOneHint: '当前只有 1 张可用壁纸，没有可切换的对象。换一个来源或再添加一些图片。',
      knownErrors: '部分来源被跳过：',
      noConfig: '读取背景设置失败。',
      seconds: ' 秒',
    }

    const EN = {
      title: 'Background Wallpaper',
      description: 'Paints a wallpaper behind the UI from image URLs, local files, or a downloaded Wallpaper Engine library.',
      loading: 'Reading background settings…',
      sourceGroup: 'Sources',
      sourceHint: 'Only the selected source is used; switching reloads immediately.',
      tabUrls: 'Image URLs',
      tabLocal: 'Local images',
      tabWe: 'Wallpaper Engine',
      urlsRandomNote: 'URL sources may return a different picture per request, so they play in order; random order applies to local images and the wallpaper library.',
      urlsCachedNote: 'Image-URL pictures are archived per URL: every switch fetches a new picture and keeps the old ones under “Loaded images”, even after a restart.',
      urlsTitle: 'Image URLs',
      urlsDesc: 'One direct image URL per line (https://…); GIF and video links work too.',
      urlsPlaceholder: 'https://example.com/wallpaper.jpg',
      cacheUrlsTitle: 'Cache image-URL pictures locally',
      cacheUrlsDesc: 'When on, every switch to this image-URL downloads and caches a new picture without overwriting older ones; turn it off to request the URL directly without writing to disk.',
      cacheDirTitle: 'Cache folder',
      cacheDirDesc: 'Media imported with “Pick folder” and cached image-URL pictures are stored here. Leave empty to use the default folder.',
      cacheDirPlaceholder: '.dsh/data/dsh-skin/library',
      pickCacheDir: 'Pick folder',
      resetCacheDir: 'Reset',
      cacheDirEffective: 'Using:',
      cacheRestartNote: 'The cache folder and URL caching are read by the Host process; restart DSH to apply.',
      localTitle: 'Local images and folders',
      localDesc: 'Add one image file or a whole folder. The Host plugin reads the file, so the browser needs no file access.',
      localPlaceholder: 'e.g. D:\\Pictures\\wallpaper.jpg',
      addPath: 'Add',
      pickFolder: 'Pick folder',
      folderHint: '“Pick folder” copies its images/videos into the cache folder set below (default .dsh/data/dsh-skin/library); the originals are untouched. You can also type a folder path and press Add.',
      galleryTitle: 'Loaded images',
      galleryHint: 'Click an image to switch right away; hover it and click the × to remove it. Cached image-URL pictures persist across restarts.',
      cachedItem: 'cached picture',
      deleteImage: 'Remove this image',
      clearAll: 'Clear',
      clearConfirm: 'Clear all?',
      galleryEmpty: 'Nothing loaded yet. Add a source above.',
      importing: 'Importing',
      importEmpty: 'That folder has no usable images or videos.',
      importFailed: 'Import failed:',
      importCapped: 'At most 200 files per import; the rest were skipped.',
      pickerTimeout: 'The system folder picker did not respond; paste the path into the field instead.',
      pickerFailed: 'The system folder picker is unavailable; paste the path instead:',
      weTitle: 'Wallpaper Engine',
      weDesc: 'Point at the workshop 431960 folder, or at one downloaded wallpaper folder; its images and videos are scanned.',
      wePlaceholder: 'e.g. D:\\Steam\\steamapps\\workshop\\content\\431960',
      pickWe: 'Pick folder',
      refresh: 'Rescan',
      appearanceGroup: 'Appearance',
      opacityTitle: 'Wallpaper opacity',
      opacityDesc: 'How strong the wallpaper itself is; 0 leaves only the theme base colour.',
      surfaceTitle: 'Interface opacity',
      surfaceDesc: 'How much the main panels and sidebar cover the wallpaper; 100 is fully opaque. Dialogs such as Settings stay opaque either way.',
      blurTitle: 'Blur',
      blurDesc: 'Gaussian blur on the wallpaper only, never on the interface.',
      playGroup: 'Playback',
      intervalTitle: 'Slide interval',
      intervalDesc: 'Seconds before switching; with a single wallpaper it is re-requested at this interval.',
      advanceOnEndTitle: 'Advance when a video ends',
      advanceOnEndDesc: 'Videos play once and then switch; turn this off to loop them and let the interval decide.',
      videoMutedTitle: 'Mute videos by default',
      videoMutedDesc: 'Play videos muted. When off, videos play with sound; if the browser blocks autoplay it falls back to muted.',
      shortcutHint: 'Shortcuts: previous / next wallpaper. Rebind them under Settings → General → Shortcuts, or press Ctrl + / (⌘ + / on Mac).',
      shortcutNext: 'Next wallpaper',
      shortcutPrev: 'Previous wallpaper',
      shortcutError: 'Shortcut registration failed:',
      randomTitle: 'Random order',
      randomDesc: 'Pick a random wallpaper each time instead of cycling in order.',
      fadeTitle: 'Crossfade',
      fadeDesc: 'Duration of the crossfade between two wallpapers.',
      next: 'Next',
      prev: 'Previous',
      pause: 'Pause',
      resume: 'Resume',
      enableTitle: 'Enable wallpaper',
      enableDesc: 'Turning this off removes the wallpaper layer and restores the plain interface.',
      statusLoaded: 'Wallpapers loaded',
      statusNone: 'No wallpaper yet. Add a source below.',
      statusSaving: 'Saving…',
      statusPaused: 'Paused',
      currentItem: 'Current',
      loadFailed: 'That one failed to load; the previous wallpaper is kept:',
      onlyOneHint: 'Only one wallpaper is available, so there is nothing to switch to. Choose another source or add more pictures.',
      knownErrors: 'Some sources were skipped:',
      noConfig: 'Could not read the background settings.',
      seconds: ' s',
    }

    const MAX_IMPORT_FILES = 200
    const MAX_UPLOAD_BYTES = 64 * 1024 * 1024
    const MEDIA_NAME = /\.(png|jpe?g|jfif|webp|gif|avif|bmp|svg|mp4|webm|ogv|mov|m4v)$/i

    return {
      inject: ['slots', 'theme', 'locale', 'uiWorkspace', 'shortcuts'],
      apply(ctx) {
        const snapshot = ctx.locale.getLocale()
        const locales = Array.isArray(snapshot.locales) && snapshot.locales.length > 0
          ? snapshot.locales
          : [{ id: 'en' }, { id: 'zh' }]
        for (const locale of locales) {
          const dict = /^zh/i.test(locale.id) ? ZH : EN
          ctx.effect(() => ctx.locale.register(NS, locale.id, dict))
        }
        const t = ctx.locale.bind(NS)

        /* ------------------------------------------------------------------ */
        /* state                                                               */
        /* ------------------------------------------------------------------ */

        const state = {
          config: null,
          items: [],
          cache: [],
          preview: null,
          errors: [],
          index: 0,
          paused: false,
          loading: true,
          saving: false,
          notice: '',
          lastError: '',
          defaultCacheDir: '',
        }
        const listeners = new Set()
        const emit = () => {
          for (const listener of listeners) listener()
        }
        const setState = (patch) => {
          Object.assign(state, patch)
          emit()
        }

        let layer = null
        let current = null
        let saveTimer = null
        let slideTimer = null
        let errorTimer = null
        let cacheTimer = null
        let surfaceDispose = null
        let surfaceBusy = false
        let lastThemeKey = null
        let dialogSurface = null
        let dialogLayer2 = ''
        let baseRgb = ''
        let colorContext = null
        let errorRun = 0
        let shortcutFailure = ''

        const errorText = (error) => (error instanceof Error ? error.message : String(error))

        function themeTokens() {
          const active = ctx.theme.getTheme().active
          return (active && active.tokens) || {}
        }

        function tokenValue(name) {
          // The theme presenter writes tokens as inline custom properties on
          // <body>, and the palettes declare them there too, so the resolved
          // value is only readable from that element.
          try {
            const computed = getComputedStyle(document.body).getPropertyValue(name)
            if (typeof computed === 'string' && computed.trim() !== '') return computed.trim()
          } catch {
            /* the document may not be ready yet */
          }
          const tokens = themeTokens()
          return typeof tokens[name] === 'string' ? tokens[name] : ''
        }

        function isDarkScheme() {
          return document.body !== null && document.body.hasAttribute('data-ds-dark-theme')
        }

        function captureBase() {
          // Read the palette colour with this plugin's own override lifted, so
          // the wallpaper layer keeps an opaque backing while the frame fades.
          const previous = surfaceDispose
          let lifted = false
          if (previous !== null) {
            surfaceDispose = null
            const busy = surfaceBusy
            surfaceBusy = true
            try {
              previous()
            } finally {
              surfaceBusy = busy
            }
            lifted = true
          }
          try {
            const value = getComputedStyle(document.body).backgroundColor
            if (typeof value === 'string' && value !== '' && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
              baseRgb = value
            }
          } catch {
            /* keep the previous base colour */
          }
          if (lifted) applySurface()
        }

        function ensureBase() {
          if (baseRgb === '') captureBase()
        }

        function baseColor() {
          if (baseRgb !== '') return baseRgb
          return isDarkScheme() ? '#161616' : '#ffffff'
        }

        function rgbaOf(value, alpha) {
          if (typeof value !== 'string' || value.trim() === '') return null
          try {
            if (colorContext === null) {
              const canvas = document.createElement('canvas')
              colorContext = canvas.getContext('2d')
              if (colorContext === null) return null
            }
            colorContext.fillStyle = '#000001'
            colorContext.fillStyle = value
            const normalized = colorContext.fillStyle
            if (normalized === '#000001') return null
            if (normalized.startsWith('#')) {
              const hex = normalized.slice(1)
              const full = hex.length === 3
                ? hex.split('').map((part) => part + part).join('')
                : hex
              const red = parseInt(full.slice(0, 2), 16)
              const green = parseInt(full.slice(2, 4), 16)
              const blue = parseInt(full.slice(4, 6), 16)
              return `rgba(${red}, ${green}, ${blue}, ${alpha})`
            }
            const match = /^rgba?\(([^)]+)\)$/.exec(normalized)
            if (match !== null) {
              const parts = match[1].split(/[\s,/]+/).filter((part) => part !== '')
              if (parts.length >= 3) {
                return `rgba(${Number(parts[0])}, ${Number(parts[1])}, ${Number(parts[2])}, ${alpha})`
              }
            }
            return null
          } catch {
            return null
          }
        }

        /* ------------------------------------------------------------------ */
        /* wallpaper layer                                                     */
        /* ------------------------------------------------------------------ */

        function ensureLayer() {
          if (layer !== null) return layer
          if (!document.body) return null
          ensureBase()
          const element = document.createElement('div')
          element.setAttribute('data-dsh-skin-bg', '')
          element.setAttribute('aria-hidden', 'true')
          element.style.cssText = [
            'position:fixed',
            'inset:0',
            'z-index:-1',
            'pointer-events:none',
            'overflow:hidden',
            `background-color:${baseColor()}`,
          ].join(';')
          if (document.body.firstChild !== null) document.body.insertBefore(element, document.body.firstChild)
          else document.body.appendChild(element)
          layer = element
          return layer
        }

        function clearMedia() {
          if (errorTimer !== null) {
            clearTimeout(errorTimer)
            errorTimer = null
          }
          if (layer !== null) {
            while (layer.firstChild !== null) layer.removeChild(layer.firstChild)
          }
          current = null
        }

        function destroyLayer() {
          clearMedia()
          if (layer !== null) {
            layer.remove()
            layer = null
          }
        }

        function mediaStyle(node, config) {
          const blur = Number(config.blur) || 0
          node.style.filter = blur > 0 ? `blur(${blur}px)` : 'none'
          node.style.transform = blur > 0 ? 'scale(1.06)' : 'none'
        }

        function visibleOpacity() {
          const config = state.config
          if (config === null) return 1
          return Math.min(1, Math.max(0, Number(config.opacity) / 100))
        }

        function applyVisuals() {
          if (layer === null || state.config === null) return
          ensureBase()
          layer.style.backgroundColor = baseColor()
          if (current !== null) {
            mediaStyle(current.node, state.config)
            if (current.node.tagName === 'VIDEO') {
              current.node.loop = state.config.advanceOnEnd === false
              current.node.muted = state.config.videoMuted !== false
              if (current.node.muted) current.node.setAttribute('muted', '')
              else current.node.removeAttribute('muted')
            }
            current.wrap.style.transition = `opacity ${state.config.fadeSec}s ease`
            current.wrap.style.opacity = String(visibleOpacity())
          }
        }

        function bumpSource(src) {
          // A single image host URL can hand out a different picture per
          // request; re-fetching it needs a cache-busting query, otherwise the
          // interval would only re-read the browser cache. The Host's remote
          // proxy route is cacheable too, so a fresh copy needs the same
          // treatment as a direct URL.
          const remoteRoute = src.startsWith(`${API}/remote`)
          if (!/^https?:/i.test(src) && !remoteRoute) return src
          const separator = src.includes('?') ? '&' : '?'
          return `${src}${separator}_dshbg=${Date.now()}`
        }

        function advance(delta, fromError) {
          const total = state.items.length
          if (state.preview !== null) state.preview = null
          if (total === 0) {
            render(false, false)
            emit()
            return
          }
          const urlsMode = state.config !== null && state.config.source === 'urls'
          if (total === 1) {
            const only = current !== null ? current.node : null
            if (only !== null && only.tagName === 'VIDEO' && fromError !== true) {
              // A single video that just ended: replay it instead of
              // re-downloading the same file.
              try {
                only.currentTime = 0
                const playing = only.play()
                if (playing && typeof playing.catch === 'function') playing.catch(() => {})
              } catch {
                /* a torn-down element is not replays-able */
              }
              schedule()
              emit()
              return
            }
            // One source still rotates: the interval re-requests it. In URL
            // mode `fetchFresh` makes the cache archive a new picture instead
            // of serving the previous one.
            if (fromError === true) render(false, false)
            else render(true, urlsMode)
            if (!fromError) schedule()
            emit()
            return
          }
          let next = state.index
          if (state.config !== null && state.config.random && state.config.source !== 'urls') {
            for (let attempt = 0; attempt < 12 && next === state.index; attempt += 1) {
              next = Math.floor(Math.random() * total)
            }
          } else {
            next = ((state.index + delta) % total + total) % total
          }
          if (next === state.index && !fromError) return
          state.index = next
          render(urlsMode && !fromError, urlsMode && !fromError)
          if (!fromError) schedule()
          emit()
        }

        function handleMediaError(item, wrap, previous) {
          if (wrap.parentNode !== null) wrap.parentNode.removeChild(wrap)
          if (current !== null && current.wrap === wrap) current = previous
          setState({ lastError: item.label || item.src })
          errorRun += 1
          if (state.items.length > 1 && errorRun < state.items.length && errorTimer === null) {
            errorTimer = setTimeout(() => {
              errorTimer = null
              if (layer !== null) advance(1, true)
            }, 80)
          } else {
            errorRun = 0
          }
        }

        function render(forceReload, fetchFresh) {
          const config = state.config
          if (config === null || !config.enabled) {
            clearMedia()
            return
          }
          if (state.preview === null && state.items.length === 0) {
            clearMedia()
            return
          }
          if (ensureLayer() === null) return
          if (state.items.length > 0) {
            state.index = ((state.index % state.items.length) + state.items.length) % state.items.length
          } else {
            state.index = 0
          }
          const item = state.preview !== null ? state.preview : state.items[state.index]
          if (item === undefined) {
            clearMedia()
            return
          }
          const fresh = fetchFresh === true && item.remote === true && config.cacheUrls !== false
          const same = current !== null && current.src === item.src
          if (same && forceReload !== true && !fresh) {
            applyVisuals()
            return
          }
          let url = item.src
          if (fresh) url += `${url.includes('?') ? '&' : '?'}fresh=1`
          if (forceReload === true) url = bumpSource(url)
          const fade = Number(config.fadeSec) || 0
          const previous = current

          const wrap = document.createElement('div')
          wrap.style.cssText = `position:absolute;inset:0;opacity:0;transition:opacity ${fade}s ease;`
          const node = document.createElement(item.kind === 'video' ? 'video' : 'img')
          node.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;'
          node.setAttribute('referrerpolicy', 'no-referrer')
          mediaStyle(node, config)

          const settle = () => {
            if (current === null || current.wrap !== wrap) return
            errorRun = 0
            if (state.lastError !== '') setState({ lastError: '' })
            wrap.style.opacity = String(visibleOpacity())
            // The outgoing wallpaper only leaves once the new one is painted,
            // so a slow or failing source never blanks the background.
            if (previous !== null && previous.wrap !== wrap && previous.wrap.parentNode !== null) {
              previous.wrap.style.transition = `opacity ${fade}s ease`
              previous.wrap.style.opacity = '0'
              const stale = previous.wrap
              setTimeout(() => {
                if (stale.parentNode !== null) stale.parentNode.removeChild(stale)
              }, fade * 1000 + 140)
            }
            // A fresh image-URL request has just been written to the cache:
            // refresh the gallery so the new picture shows up there too.
            if (fresh) refreshCache()
          }

          current = { src: item.src, wrap, node, fresh }

          if (item.kind === 'video') {
            const advanceOnEnd = config.advanceOnEnd !== false
            const muted = config.videoMuted !== false
            node.muted = muted
            node.loop = !advanceOnEnd
            node.autoplay = true
            node.playsInline = true
            if (muted) node.setAttribute('muted', '')
            node.setAttribute('playsinline', '')
            node.setAttribute('disablepictureinpicture', '')
            node.addEventListener('error', () => handleMediaError(item, wrap, previous), { once: true })
            node.addEventListener('ended', () => {
              if (current === null || current.node !== node) return
              if (state.config === null || state.config.advanceOnEnd === false) return
              advance(1, false)
            })
            if (fresh) node.addEventListener('loadeddata', refreshCache, { once: true })
            node.src = url
            const playing = node.play()
            if (playing && typeof playing.catch === 'function') {
              playing.catch((error) => {
                // Browsers only allow sound with a prior user gesture; fall
                // back to a muted play instead of freezing the wallpaper.
                if (!node.muted && error && error.name === 'NotAllowedError') {
                  node.muted = true
                  node.setAttribute('muted', '')
                  const retry = node.play()
                  if (retry && typeof retry.catch === 'function') retry.catch(() => {})
                }
              })
            }
            wrap.appendChild(node)
            layer.appendChild(wrap)
            settle()
            return
          }

          node.decoding = 'async'
          node.alt = ''
          node.addEventListener('load', settle, { once: true })
          node.addEventListener('error', () => handleMediaError(item, wrap, previous), { once: true })
          node.src = url
          wrap.appendChild(node)
          layer.appendChild(wrap)
        }

        /* ------------------------------------------------------------------ */
        /* theme surfaces                                                      */
        /* ------------------------------------------------------------------ */

        function disposeSurface() {
          if (surfaceDispose !== null) {
            surfaceDispose()
            surfaceDispose = null
          }
        }

        function currentThemeKey() {
          const active = ctx.theme.getTheme().active
          return active ? `${active.id}|${active.colorScheme}` : 'none'
        }

        /*
         * Dialogs are body-portaled and share the interface tokens, so they would
         * otherwise fade with the frame. Restoring the theme's own opaque
         * `bg-layer-2` on every dialog root keeps the settings (and any other)
         * dialog solid while the main interface stays translucent.
         */
        function disposeDialogSurface() {
          dialogLayer2 = ''
          if (dialogSurface !== null) {
            dialogSurface.remove()
            dialogSurface = null
          }
        }

        function applyDialogSurface() {
          if (dialogLayer2 === '' || !document.head) {
            disposeDialogSurface()
            return
          }
          if (dialogSurface === null) {
            dialogSurface = document.createElement('style')
            dialogSurface.setAttribute('data-dsh-skin-bg-dialog', '')
            document.head.appendChild(dialogSurface)
          }
          const css = `[role="dialog"],[aria-modal="true"]{--dsw-alias-bg-layer-2:${dialogLayer2}}`
          if (dialogSurface.textContent !== css) dialogSurface.textContent = css
        }

        function applySurface() {
          if (surfaceBusy) return
          lastThemeKey = currentThemeKey()
          const config = state.config
          if (config === null || !config.enabled || (state.items.length === 0 && state.preview === null) || config.surfaceOpacity >= 100) {
            disposeSurface()
            disposeDialogSurface()
            return
          }
          const alpha = Math.min(1, Math.max(0, Number(config.surfaceOpacity) / 100))
          const overrides = {}
          const put = (name, extra) => {
            const value = rgbaOf(tokenValue(name) || tokenValue('--dsw-alias-bg-base'), Math.min(1, alpha + extra))
            if (value !== null) overrides[name] = { light: value, dark: value }
          }
          put('--dsw-alias-bg-base', 0)
          put('--dsw-specific-sidebar-fill', 0.06)
          put('--dsw-alias-bg-layer-1', 0.22)
          put('--dsw-alias-bg-layer-2', 0.28)
          put('--dsw-alias-bg-overlay', 0.3)
          if (Object.keys(overrides).length === 0) {
            disposeDialogSurface()
            return
          }
          // The opaque twin of the same token: rgbaOf parses the rgb parts and
          // replaces the alpha, so it resolves correctly even while this plugin's
          // translucent layer is already applied.
          dialogLayer2 = rgbaOf(tokenValue('--dsw-alias-bg-layer-2') || tokenValue('--dsw-alias-bg-base'), 1) || ''
          surfaceBusy = true
          try {
            disposeSurface()
            surfaceDispose = ctx.theme.overrideTokens(NS, overrides)
          } finally {
            surfaceBusy = false
          }
          applyDialogSurface()
        }

        /* ------------------------------------------------------------------ */
        /* playback                                                            */
        /* ------------------------------------------------------------------ */

        function schedule() {
          if (slideTimer !== null) {
            clearTimeout(slideTimer)
            slideTimer = null
          }
          const config = state.config
          if (config === null || !config.enabled || state.paused || state.items.length === 0) return
          const currentItem = state.items[state.index]
          if (currentItem !== undefined && currentItem.kind === 'video' && config.advanceOnEnd !== false) {
            // The video's own `ended` event switches the wallpaper.
            return
          }
          const seconds = Math.max(1, Number(config.intervalSec) || 30)
          slideTimer = setTimeout(() => {
            slideTimer = null
            errorRun = 0
            advance(1, false)
            schedule()
          }, seconds * 1000)
        }

        function sync() {
          if (state.config === null) {
            return
          }
          if (state.preview !== null && !state.cache.some((entry) => entry.src === state.preview.src)) {
            state.preview = null
          }
          if (!state.config.enabled || (state.items.length === 0 && state.preview === null)) {
            destroyLayer()
          } else {
            if (state.index >= state.items.length) state.index = 0
            render()
            applyVisuals()
          }
          applySurface()
          schedule()
        }

        /* ------------------------------------------------------------------ */
        /* host I/O                                                            */
        /* ------------------------------------------------------------------ */

        async function load(force) {
          try {
            const response = await fetch(`${API}/state${force ? '?refresh=1' : ''}`, { cache: 'no-store' })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const data = await response.json()
            setState({
              config: data.config,
              items: Array.isArray(data.playlist && data.playlist.items) ? data.playlist.items : [],
              cache: Array.isArray(data.cache) ? data.cache : [],
              errors: Array.isArray(data.playlist && data.playlist.errors) ? data.playlist.errors : [],
              loading: false,
              notice: '',
              lastError: '',
              defaultCacheDir: typeof data.defaultCacheDir === 'string' ? data.defaultCacheDir : '',
            })
            errorRun = 0
            sync()
          } catch (error) {
            setState({ loading: false, notice: errorText(error) })
          }
        }

        function refreshCache() {
          if (cacheTimer !== null) clearTimeout(cacheTimer)
          cacheTimer = setTimeout(async () => {
            cacheTimer = null
            if (state.config === null) return
            try {
              const response = await fetch(`${API}/cache`, { cache: 'no-store' })
              if (!response.ok) return
              const data = await response.json()
              if (Array.isArray(data.cache)) setState({ cache: data.cache })
            } catch {
              /* the wallpaper still works without the refreshed list */
            }
          }, 700)
        }

        function saveSoon() {
          setState({ saving: true })
          if (saveTimer !== null) clearTimeout(saveTimer)
          saveTimer = setTimeout(async () => {
            saveTimer = null
            const sent = state.config
            try {
              const response = await fetch(`${API}/config`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(sent),
              })
              const data = await response.json()
              if (!response.ok) throw new Error(data && data.error ? data.error : `HTTP ${response.status}`)
              // A newer edit landed while this request was in flight; its own
              // save owns the playlist, so do not clobber it with stale items.
              if (state.config !== sent) return
              setState({
                items: Array.isArray(data.playlist && data.playlist.items) ? data.playlist.items : [],
                cache: Array.isArray(data.cache) ? data.cache : state.cache,
                errors: Array.isArray(data.playlist && data.playlist.errors) ? data.playlist.errors : [],
                saving: false,
                notice: '',
              })
              errorRun = 0
              sync()
            } catch (error) {
              setState({ saving: false, notice: errorText(error) })
            }
          }, 650)
        }

        function patchConfig(patch) {
          if (state.config === null) return
          if (patch.source !== undefined && patch.source !== state.config.source) {
            state.index = 0
            state.preview = null
          }
          setState({ config: Object.assign({}, state.config, patch) })
          sync()
          saveSoon()
        }

        function select(index) {
          if (state.items.length === 0) return
          state.preview = null
          state.index = ((index % state.items.length) + state.items.length) % state.items.length
          const urlsMode = state.config !== null && state.config.source === 'urls'
          // Switching to an image-URL item asks the Host for a fresh picture
          // (cached) instead of reusing the one already on screen.
          render(urlsMode, urlsMode)
          emit()
          schedule()
        }

        function previewCache(item) {
          if (item === undefined || item === null) return
          state.preview = item
          render()
          emit()
          schedule()
        }

        /* ------------------------------------------------------------------ */
        /* lifecycle                                                           */
        /* ------------------------------------------------------------------ */

        ctx.effect(() => () => {
          if (saveTimer !== null) clearTimeout(saveTimer)
          if (slideTimer !== null) clearTimeout(slideTimer)
          if (errorTimer !== null) clearTimeout(errorTimer)
          if (cacheTimer !== null) clearTimeout(cacheTimer)
          destroyLayer()
          disposeSurface()
          disposeDialogSurface()
        })

        ctx.on('theme/change', () => {
          const key = currentThemeKey()
          if (key === lastThemeKey) return
          lastThemeKey = key
          captureBase()
          if (layer !== null) layer.style.backgroundColor = baseColor()
          applySurface()
        })

        ctx.effect(() => {
          const onVisibility = () => {
            if (document.hidden) {
              if (slideTimer !== null) clearTimeout(slideTimer)
              slideTimer = null
            } else {
              schedule()
            }
          }
          document.addEventListener('visibilitychange', onVisibility)
          return () => document.removeEventListener('visibilitychange', onVisibility)
        })

        load(false)

        /* ------------------------------------------------------------------ */
        /* view                                                                */
        /* ------------------------------------------------------------------ */

        function useEngine() {
          const [, force] = React.useState(0)
          React.useEffect(() => {
            const listener = () => force((version) => version + 1)
            listeners.add(listener)
            return () => {
              listeners.delete(listener)
            }
          }, [])
          return state
        }

        function useLocaleRevision() {
          const [, force] = React.useState(0)
          React.useEffect(() => ctx.locale.subscribe(() => force((version) => version + 1)), [])
        }

        const rowStyle = {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          padding: '12px 0',
          borderBottom: '1px solid var(--dsw-alias-border-l1)',
        }
        const labelStyle = { fontSize: '13px', color: 'var(--dsw-alias-label-primary)', lineHeight: 1.5 }
        const descStyle = { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)', marginTop: '2px', lineHeight: 1.5 }
        const fieldStyle = {
          background: 'var(--dsw-alias-bg-layer-2)',
          border: '1px solid var(--dsw-alias-border-l1)',
          borderRadius: '8px',
          color: 'var(--dsw-alias-label-primary)',
          fontSize: '12px',
          padding: '7px 10px',
          outline: 'none',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }

        // Both controls come from the Host's own ui primitives, so the switch
        // capsule, its corner shape, and the light and dark colour tokens cannot
        // drift from the rest of the settings UI. The wrapper only pins the
        // compact size and the refuse-to-shrink width this panel has always used;
        // a call site that wants the filled action passes `variant: 'primary'`.
        const Button = (props) => h(UiButton, {
          size: 'sm',
          variant: 'outline',
          ...props,
          style: { flex: '0 0 auto', ...props.style },
        })

        function SwitchRow(props) {
          return h('div', { style: rowStyle },
            h('div', { style: { minWidth: 0 } },
              h('div', { style: labelStyle }, props.title),
              props.desc ? h('div', { style: descStyle }, props.desc) : null),
            h(Switch, { checked: props.checked, onChange: props.onChange, label: props.title }))
        }

        function SliderRow(props) {
          return h('div', { style: rowStyle },
            h('div', { style: { minWidth: 0 } },
              h('div', { style: labelStyle }, props.title),
              props.desc ? h('div', { style: descStyle }, props.desc) : null),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 auto' } },
              h('input', {
                type: 'range',
                min: props.min,
                max: props.max,
                step: props.step || 1,
                value: props.value,
                'aria-label': props.title,
                onChange: (event) => props.onChange(Number(event.target.value)),
                style: { width: '150px', accentColor: 'var(--dsw-alias-brand-primary)' },
              }),
              h('span', {
                style: {
                  fontSize: '12px',
                  color: 'var(--dsw-alias-label-secondary)',
                  minWidth: '46px',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                },
              }, `${props.value}${props.suffix || ''}`)))
        }

        function GroupTitle(props) {
          return h('div', {
            style: {
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--dsw-alias-label-secondary)',
              padding: '20px 0 4px',
            },
          }, props.children)
        }

        const GALLERY_HEIGHT = 232

        function LoadedGallery(props) {
          const [hovered, setHovered] = React.useState('')
          const [confirmClear, setConfirmClear] = React.useState(false)
          const items = props.items
          const cached = Array.isArray(props.cached) ? props.cached : []
          const total = items.length + cached.length
          const isEmpty = total === 0

          const fileName = (label) => {
            const parts = String(label || '').split(/[\\/]/)
            return parts[parts.length - 1] || String(label || '')
          }
          const titleOf = (item) => {
            const label = item.label || item.src
            if (item.cached && props.cacheCaption) {
              const date = props.cacheCaption(item)
              if (date !== '') return `${date} · ${label}`
            }
            return label
          }
          const captionOf = (item) => {
            if (item.cached) {
              return props.cacheCaption ? props.cacheCaption(item) : fileName(item.label)
            }
            return fileName(item.label) || item.src
          }

          const boxStyle = {
            marginTop: '8px',
            height: `${GALLERY_HEIGHT}px`,
            boxSizing: 'border-box',
            padding: '10px',
            border: '1px solid var(--dsw-alias-border-l1)',
            borderRadius: '10px',
            background: 'var(--dsw-alias-bg-layer-1)',
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehavior: 'contain',
          }
          const gridStyle = {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))',
            gap: '8px',
          }

          const tile = (item, active, onSelect, onRemove) => {
            const key = item.src
            const visible = hovered === key
            return h('div', {
              key,
              role: 'button',
              tabIndex: 0,
              title: titleOf(item),
              'aria-label': titleOf(item),
              'aria-current': active ? 'true' : undefined,
              onClick: onSelect,
              onKeyDown: (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect()
                }
              },
              onMouseEnter: () => setHovered(key),
              onMouseLeave: () => setHovered((current) => (current === key ? '' : current)),
              onFocus: () => setHovered(key),
              onBlur: (event) => {
                if (event.currentTarget.contains(event.relatedTarget)) return
                setHovered((current) => (current === key ? '' : current))
              },
              style: {
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '3px',
                borderRadius: '9px',
                cursor: 'pointer',
                outline: 'none',
                boxSizing: 'border-box',
                border: active
                  ? '2px solid var(--dsw-alias-brand-primary)'
                  : '2px solid transparent',
                background: active || visible
                  ? 'var(--dsw-alias-bg-layer-2)'
                  : 'transparent',
              },
            },
            h('div', {
              style: {
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 10',
                borderRadius: '6px',
                overflow: 'hidden',
                background: 'var(--dsw-alias-bg-layer-2)',
              },
            },
            item.kind === 'video'
              ? h('span', {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    fontSize: '12px',
                    color: 'var(--dsw-alias-label-secondary)',
                  },
                }, '▶')
              : h('img', {
                  src: item.src,
                  alt: '',
                  loading: 'lazy',
                  decoding: 'async',
                  style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
                }),
            h('button', {
              type: 'button',
              title: props.deleteLabel,
              'aria-label': props.deleteLabel,
              tabIndex: visible ? 0 : -1,
              onClick: (event) => {
                event.stopPropagation()
                onRemove()
              },
              onKeyDown: (event) => event.stopPropagation(),
              style: {
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                border: 'none',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.56)',
                color: '#ffffff',
                fontFamily: 'inherit',
                fontSize: '13px',
                lineHeight: 1,
                cursor: 'pointer',
                opacity: visible ? 1 : 0,
                transition: 'opacity .12s ease',
                pointerEvents: visible ? 'auto' : 'none',
              },
            }, '×')),
            h('div', {
              style: {
                fontSize: '10px',
                lineHeight: 1.5,
                color: 'var(--dsw-alias-label-secondary)',
                padding: '0 2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            }, captionOf(item)))
          }

          // Cached image-URL pictures sit in the same grid as the playlist:
          // there is no separate section heading, so the box keeps looking like
          // the thumbnail grid it has always been.
          const entries = items
            .map((item, position) => ({ item, cached: false, position }))
            .concat(cached.map((item) => ({ item, cached: true })))

          return h('div', { style: { padding: '16px 0 0' } },
            h('div', {
              style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' },
            },
            h('div', { style: labelStyle }, isEmpty ? props.title : `${props.title} · ${total}`),
            !isEmpty && items.length > 0 && props.onClear
              ? h('button', {
                  type: 'button',
                  onClick: () => {
                    if (confirmClear) {
                      setConfirmClear(false)
                      props.onClear()
                      return
                    }
                    setConfirmClear(true)
                  },
                  onBlur: () => setConfirmClear(false),
                  style: {
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    fontFamily: 'inherit',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: confirmClear
                      ? 'var(--dsw-alias-state-warn-primary)'
                      : 'var(--dsw-alias-label-secondary)',
                  },
                }, confirmClear ? props.confirmLabel : props.clearLabel)
              : null),
            h('div', { style: descStyle }, props.hint),
            h('div', { style: boxStyle },
            isEmpty
              ? h('div', {
                  style: {
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: 'var(--dsw-alias-label-secondary)',
                  },
                }, props.empty)
              : h('div', { style: gridStyle },
                  entries.map((entry) => tile(
                    entry.item,
                    entry.cached ? props.previewSrc === entry.item.src : props.index === entry.position,
                    () => (entry.cached ? props.onSelectCached(entry.item) : props.onSelect(entry.position)),
                    () => (entry.cached ? props.onRemoveCached(entry.item) : props.onRemove(entry.item, entry.position)),
                  )))))
        }

        function SourceTabs(props) {
          return h('div', {
            role: 'tablist',
            style: { display: 'flex', gap: '6px', padding: '12px 0 0' },
          }, props.items.map((item) => {
            const active = item.value === props.value
            return h('button', {
              key: item.value,
              type: 'button',
              role: 'tab',
              'aria-selected': active ? 'true' : 'false',
              onClick: () => props.onChange(item.value),
              style: {
                flex: '1 1 0',
                minWidth: 0,
                height: '32px',
                padding: '0 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: `1px solid ${active ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-border-l1)'}`,
                background: active ? 'var(--dsw-alias-bg-layer-2)' : 'transparent',
                color: active ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)',
                fontFamily: 'inherit',
                fontSize: '12px',
                fontWeight: active ? 600 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }, item.label)
          }))
        }

        function SettingsPage() {
          useEngine()
          useLocaleRevision()
          const localInput = React.useRef(null)
          const weInput = React.useRef(null)
          const folderInput = React.useRef(null)
          const [urlsDraft, setUrlsDraft] = React.useState(null)

          const config = state.config
          const column = (children) => h('div', {
            style: { display: 'flex', flexDirection: 'column', gap: '0px', padding: '4px 0 36px' },
          }, children)

          if (config === null) {
            return column(h('div', {
              style: { ...descStyle, padding: '24px 0' },
            }, state.loading ? t('loading') : (state.notice || t('noConfig'))))
          }

          const statusBits = []
          statusBits.push(state.items.length > 0 ? `${t('statusLoaded')} ${state.items.length}` : t('statusNone'))
          if (state.saving) statusBits.push(t('statusSaving'))
          if (state.paused) statusBits.push(t('statusPaused'))

          /*
           * Only local and Wallpaper Engine sources with one item really have
           * nothing to switch to. In image-URL mode next/previous asks the Host
           * for a fresh (cached) picture, so those buttons are never dead.
           */
          const onlyOne = state.items.length === 1 && config.source !== 'urls'

          const hiddenEntries = () => (Array.isArray(config.hidden) ? config.hidden : [])

          const addLocal = () => {
            const node = localInput.current
            if (node === null) return
            const value = node.value.trim()
            if (value === '') return
            node.value = ''
            patchConfig({
              files: config.files.concat(value),
              hidden: hiddenEntries().filter((entry) => entry !== value),
            })
          }

          // The Host's native directory chooser is not always reachable from
          // the Web surface, so the folder button drives a Chromium folder
          // input and copies the picked media into the plugin's own library.
          const importFolder = async (event) => {
            const picked = Array.from(event.target.files || [])
            event.target.value = ''
            const media = picked.filter((entry) => MEDIA_NAME.test(entry.name) && entry.size <= MAX_UPLOAD_BYTES)
            if (media.length === 0) {
              setState({ notice: t('importEmpty') })
              return
            }
            const limited = media.slice(0, MAX_IMPORT_FILES)
            const imported = []
            let failure = ''
            for (let position = 0; position < limited.length; position += 1) {
              const file = limited[position]
              setState({ notice: `${t('importing')} ${position + 1}/${limited.length} · ${file.name}` })
              try {
                const response = await fetch(`${API}/upload?name=${encodeURIComponent(file.name)}`, {
                  method: 'POST',
                  headers: { 'content-type': file.type || 'application/octet-stream' },
                  body: file,
                })
                const data = await response.json()
                if (!response.ok) throw new Error(data && data.error ? data.error : `HTTP ${response.status}`)
                imported.push(data.path)
              } catch (error) {
                failure = `${file.name}: ${errorText(error)}`
              }
            }
            if (imported.length > 0) {
              const added = new Set(imported)
              patchConfig({
                files: (state.config.files || []).concat(imported),
                hidden: hiddenEntries().filter((entry) => !added.has(entry)),
              })
            }
            if (failure !== '') setState({ notice: `${t('importFailed')} ${failure}` })
            else setState({ notice: media.length > limited.length ? t('importCapped') : '' })
          }

          const pickDirectory = async (onPicked) => {
            let expired = false
            const guard = setTimeout(() => {
              expired = true
            }, 45000)
            try {
              const picked = await ctx.uiWorkspace.pickDirectory()
              if (typeof picked === 'string' && picked !== '') {
                onPicked(picked)
              } else if (expired) {
                setState({ notice: t('pickerTimeout') })
              }
            } catch (error) {
              setState({ notice: `${t('pickerFailed')} ${errorText(error)}` })
            } finally {
              clearTimeout(guard)
            }
          }

          const pickWallpaperFolder = () => pickDirectory((picked) => patchConfig({ wallpaperDir: picked }))
          const pickCacheFolder = () => pickDirectory((picked) => patchConfig({ cacheDir: picked }))

          // Removing one gallery tile removes the setting that produced it:
          // the URL itself, the file entry, or - for files expanded from a
          // configured folder - a per-file hidden marker.
          const removePlaylistItem = (item, position) => {
            if (item === undefined) return
            const patch = {}
            if (source === 'urls') {
              patch.urls = config.urls.filter((entry) => entry !== item.label)
            } else if (source === 'local') {
              const files = config.files.filter((entry) => entry !== item.label)
              const folders = config.folders.filter((entry) => entry !== item.label)
              if (files.length === config.files.length && folders.length === config.folders.length) {
                patch.hidden = hiddenEntries().concat(item.label)
              } else {
                patch.files = files
                patch.folders = folders
              }
            } else {
              patch.hidden = hiddenEntries().concat(item.label)
            }

            const remaining = state.items.filter((entry, index) => index !== position)
            if (position < state.index) state.index = Math.max(0, state.index - 1)
            else if (position === state.index) {
              state.index = Math.min(state.index, Math.max(0, remaining.length - 1))
            }
            setState({ items: remaining })
            patchConfig(patch)
          }

          // Cached image-URL pictures are one file each; the tile's × removes
          // that file from the Host's cache folder.
          const removeCachedItem = async (item) => {
            if (item === undefined || typeof item.cacheId !== 'string') return
            try {
              const response = await fetch(`${API}/cache?id=${encodeURIComponent(item.cacheId)}`, { method: 'DELETE' })
              if (!response.ok) throw new Error(`HTTP ${response.status}`)
              if (state.preview !== null && state.preview.src === item.src) state.preview = null
              setState({ cache: state.cache.filter((entry) => entry.src !== item.src) })
              sync()
            } catch (error) {
              setState({ notice: errorText(error) })
            }
          }

          const cacheCaption = (item) => {
            const date = new Date(Number(item.savedAt) || 0)
            if (Number.isNaN(date.getTime())) return ''
            const pad = (value) => String(value).padStart(2, '0')
            return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
          }

          const clearSource = () => {
            if (source === 'urls') patchConfig({ urls: [] })
            else if (source === 'local') patchConfig({ files: [], folders: [], hidden: [] })
          }

          const source = config.source === 'local' || config.source === 'wallpaper' ? config.source : 'urls'

          // The image-URL item already shows the newest cached picture for its
          // address, so drop that one duplicate from the gallery; the older
          // archived pictures are the ones worth showing. Doing it here (and
          // not only in the Host) keeps it working against a Host that has not
          // been restarted yet.
          const galleryCache = (() => {
            if (source !== 'urls') return []
            if (config.cacheUrls === false) return state.cache
            const configured = new Set(config.urls)
            const seen = new Set()
            return state.cache.filter((entry) => {
              if (!configured.has(entry.label)) return true
              if (seen.has(entry.label)) return true
              seen.add(entry.label)
              return false
            })
          })()

          return column([
            h(GroupTitle, { key: 'source-title' }, t('sourceGroup')),

            h(SwitchRow, {
              key: 'enable',
              title: t('enableTitle'),
              desc: t('enableDesc'),
              checked: config.enabled,
              onChange: (value) => patchConfig({ enabled: value }),
            }),

            h(SourceTabs, {
              key: 'source-tabs',
              value: source,
              items: [
                { value: 'urls', label: t('tabUrls') },
                { value: 'local', label: t('tabLocal') },
                { value: 'wallpaper', label: t('tabWe') },
              ],
              onChange: (value) => {
                if (value !== source) patchConfig({ source: value })
              },
            }),

            h('div', { key: 'source-hint', style: { ...descStyle, padding: '8px 0 2px' } }, t('sourceHint')),

            source === 'urls' ? h('div', { key: 'urls', style: { padding: '14px 0 4px' } },
              h('div', { style: labelStyle }, t('urlsTitle')),
              h('div', { style: descStyle }, t('urlsDesc')),
              h('textarea', {
                value: urlsDraft === null ? config.urls.join('\n') : urlsDraft,
                placeholder: t('urlsPlaceholder'),
                spellCheck: false,
                rows: Math.min(6, Math.max(2, config.urls.length + 1)),
                onBlur: () => setUrlsDraft(null),
                onChange: (event) => {
                  const text = event.target.value
                  setUrlsDraft(text)
                  patchConfig({
                    urls: text.split('\n').map((line) => line.trim()).filter((line) => line !== ''),
                  })
                },
                style: {
                  ...fieldStyle,
                  width: '100%',
                  marginTop: '8px',
                  resize: 'vertical',
                  lineHeight: 1.6,
                  minHeight: '56px',
                },
              })) : null,

            source === 'local' ? h('div', { key: 'local', style: { padding: '14px 0 4px' } },
              h('div', { style: labelStyle }, t('localTitle')),
              h('div', { style: descStyle }, t('localDesc')),
              h('input', {
                ref: folderInput,
                type: 'file',
                multiple: true,
                webkitdirectory: '',
                directory: '',
                style: { display: 'none' },
                onChange: importFolder,
              }),
              h('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
                h('input', {
                  ref: localInput,
                  type: 'text',
                  placeholder: t('localPlaceholder'),
                  spellCheck: false,
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') addLocal()
                  },
                  style: { ...fieldStyle, flex: '1 1 auto', minWidth: 0 },
                }),
                h(Button, { onClick: addLocal }, t('addPath')),
                h(Button, {
                  onClick: () => {
                    if (folderInput.current !== null) folderInput.current.click()
                  },
                }, t('pickFolder'))),
              h('div', { style: { ...descStyle, marginTop: '8px' } }, t('folderHint'))) : null,

            source === 'wallpaper' ? h('div', { key: 'we', style: { padding: '14px 0 4px' } },
              h('div', { style: labelStyle }, t('weTitle')),
              h('div', { style: descStyle }, t('weDesc')),
              h('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
                h('input', {
                  ref: weInput,
                  type: 'text',
                  value: config.wallpaperDir,
                  placeholder: t('wePlaceholder'),
                  spellCheck: false,
                  onChange: (event) => patchConfig({ wallpaperDir: event.target.value }),
                  style: { ...fieldStyle, flex: '1 1 auto', minWidth: 0 },
                }),
                h(Button, { onClick: pickWallpaperFolder }, t('pickWe')),
                h(Button, { onClick: () => load(true) }, t('refresh')))) : null,

            source === 'urls' ? h(SwitchRow, {
              key: 'cache-urls',
              title: t('cacheUrlsTitle'),
              desc: t('cacheUrlsDesc'),
              checked: config.cacheUrls !== false,
              onChange: (value) => patchConfig({ cacheUrls: value }),
            }) : null,

            source !== 'wallpaper' ? h('div', { key: 'cache-dir', style: { padding: '14px 0 4px' } },
              h('div', { style: labelStyle }, t('cacheDirTitle')),
              h('div', { style: descStyle }, t('cacheDirDesc')),
              h('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
                h('input', {
                  type: 'text',
                  value: config.cacheDir || '',
                  placeholder: state.defaultCacheDir || t('cacheDirPlaceholder'),
                  spellCheck: false,
                  onChange: (event) => patchConfig({ cacheDir: event.target.value }),
                  style: { ...fieldStyle, flex: '1 1 auto', minWidth: 0, direction: 'ltr' },
                }),
                h(Button, { onClick: pickCacheFolder }, t('pickCacheDir')),
                h(Button, { onClick: () => patchConfig({ cacheDir: '' }) }, t('resetCacheDir'))),
              h('div', {
                style: { ...descStyle, marginTop: '6px', wordBreak: 'break-all' },
              }, `${t('cacheDirEffective')} ${(config.cacheDir || '').trim() || state.defaultCacheDir || t('cacheDirPlaceholder')}`),
              state.defaultCacheDir === ''
                ? h('div', {
                    style: {
                      ...descStyle,
                      marginTop: '6px',
                      color: 'var(--dsw-alias-state-warn-primary)',
                    },
                  }, t('cacheRestartNote'))
                : null) : null,

            h(LoadedGallery, {
              key: 'gallery',
              title: t('galleryTitle'),
              hint: t('galleryHint'),
              empty: t('galleryEmpty'),
              deleteLabel: t('deleteImage'),
              clearLabel: t('clearAll'),
              confirmLabel: t('clearConfirm'),
              items: state.items,
              index: state.preview !== null ? -1 : state.index,
              cached: galleryCache,
              previewSrc: state.preview !== null ? state.preview.src : '',
              cacheCaption,
              onSelect: (position) => select(position),
              onSelectCached: previewCache,
              onRemove: removePlaylistItem,
              onRemoveCached: removeCachedItem,
              onClear: source === 'wallpaper' ? null : clearSource,
            }),

            h(GroupTitle, { key: 'appearance-title' }, t('appearanceGroup')),

            h(SliderRow, {
              key: 'opacity',
              title: t('opacityTitle'),
              desc: t('opacityDesc'),
              min: 0,
              max: 100,
              value: config.opacity,
              suffix: '%',
              onChange: (value) => patchConfig({ opacity: value }),
            }),
            h(SliderRow, {
              key: 'surface',
              title: t('surfaceTitle'),
              desc: t('surfaceDesc'),
              min: 0,
              max: 100,
              value: config.surfaceOpacity,
              suffix: '%',
              onChange: (value) => patchConfig({ surfaceOpacity: value }),
            }),
            h(SliderRow, {
              key: 'blur',
              title: t('blurTitle'),
              desc: t('blurDesc'),
              min: 0,
              max: 40,
              value: config.blur,
              suffix: 'px',
              onChange: (value) => patchConfig({ blur: value }),
            }),
            h(SliderRow, {
              key: 'fade',
              title: t('fadeTitle'),
              desc: t('fadeDesc'),
              min: 0,
              max: 5,
              step: 0.2,
              value: config.fadeSec,
              suffix: ' s',
              onChange: (value) => patchConfig({ fadeSec: value }),
            }),

            h(GroupTitle, { key: 'play-title' }, t('playGroup')),

            h('div', { key: 'interval', style: rowStyle },
              h('div', { style: { minWidth: 0 } },
                h('div', { style: labelStyle }, t('intervalTitle')),
                h('div', { style: descStyle }, t('intervalDesc'))),
              h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                h('input', {
                  type: 'number',
                  min: 3,
                  max: 86400,
                  step: 1,
                  value: config.intervalSec,
                  'aria-label': t('intervalTitle'),
                  onChange: (event) => {
                    const number = Number(event.target.value)
                    if (Number.isFinite(number)) patchConfig({ intervalSec: number })
                  },
                  style: { ...fieldStyle, width: '84px', textAlign: 'right' },
                }),
                h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('seconds')))),

            h(SwitchRow, {
              key: 'advance-on-end',
              title: t('advanceOnEndTitle'),
              desc: t('advanceOnEndDesc'),
              checked: config.advanceOnEnd !== false,
              onChange: (value) => patchConfig({ advanceOnEnd: value }),
            }),

            h(SwitchRow, {
              key: 'video-muted',
              title: t('videoMutedTitle'),
              desc: t('videoMutedDesc'),
              checked: config.videoMuted !== false,
              onChange: (value) => patchConfig({ videoMuted: value }),
            }),

            source !== 'urls'
              ? h(SwitchRow, {
                  key: 'random',
                  title: t('randomTitle'),
                  desc: t('randomDesc'),
                  checked: config.random,
                  onChange: (value) => patchConfig({ random: value }),
                })
              : h('div', {
                  key: 'random-note',
                  style: { ...descStyle, padding: '14px 0' },
                }, t(config.cacheUrls === false ? 'urlsRandomNote' : 'urlsCachedNote')),

            h('div', { key: 'controls', style: { display: 'flex', gap: '8px', padding: '16px 0 0', flexWrap: 'wrap' } },
              h(Button, {
                onClick: () => {
                  if (onlyOne) setState({ notice: t('onlyOneHint') })
                  advance(-1, false)
                },
              }, t('prev')),
              h(Button, {
                onClick: () => {
                  if (onlyOne) setState({ notice: t('onlyOneHint') })
                  advance(1, false)
                },
              }, t('next')),
              h(Button, {
                onClick: () => {
                  state.paused = !state.paused
                  emit()
                  schedule()
                },
              }, state.paused ? t('resume') : t('pause'))),

            onlyOne
              ? h('div', {
                  key: 'only-one-hint',
                  style: { ...descStyle, padding: '8px 0 0', color: 'var(--dsw-alias-state-warn-primary)' },
                }, t('onlyOneHint'))
              : null,

            h('div', {
              key: 'shortcut-hint',
              style: { ...descStyle, padding: '8px 0 0' },
            }, t('shortcutHint')),

            shortcutFailure !== ''
              ? h('div', {
                  key: 'shortcut-error',
                  style: {
                    padding: '4px 0 0',
                    fontSize: '12px',
                    color: 'var(--dsw-alias-state-warn-primary)',
                  },
                }, `${t('shortcutError')} ${shortcutFailure}`)
              : null,

            h('div', {
              key: 'status',
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '14px 0 0',
                fontSize: '12px',
                color: 'var(--dsw-alias-label-secondary)',
              },
            },
            h('div', null, statusBits.join(' · ')),
            state.preview !== null
              ? h('div', {
                  style: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    direction: 'ltr',
                  },
                }, `${t('currentItem')} ${t('cachedItem')} · ${state.preview.label || state.preview.src}`)
              : state.items.length > 0
                ? h('div', {
                    style: {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      direction: 'ltr',
                    },
                  }, `${t('currentItem')} ${state.index + 1}/${state.items.length} · ${state.items[Math.min(state.index, state.items.length - 1)].label || state.items[Math.min(state.index, state.items.length - 1)].src}`)
                : null,
            state.lastError !== ''
              ? h('div', { style: { color: 'var(--dsw-alias-state-warn-primary)' } }, `${t('loadFailed')} ${state.lastError}`)
              : null,
            state.notice !== ''
              ? h('div', { style: { color: 'var(--dsw-alias-state-warn-primary)' } }, state.notice)
              : null,
            state.errors.length > 0
              ? h('div', { style: { color: 'var(--dsw-alias-state-warn-primary)' } },
                  h('div', null, t('knownErrors')),
                  state.errors.slice(0, 4).map((error) => h('div', { key: error, style: { opacity: 0.9 } }, error)))
              : null),
          ])
        }

        class SettingsBoundary extends React.Component {
          constructor(props) {
            super(props)
            this.state = { error: null }
          }

          static getDerivedStateFromError(error) {
            return { error }
          }

          render() {
            if (this.state.error !== null) {
              return h('div', {
                style: {
                  padding: '24px 0',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: 'var(--dsw-alias-state-error-primary)',
                },
              }, String(this.state.error && this.state.error.message ? this.state.error.message : this.state.error))
            }
            return this.props.children
          }
        }

        function SettingsSlotEntry() {
          return h(SettingsBoundary, null, h(SettingsPage))
        }

        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: NS,
          order: 30,
          label: () => t('title'),
        }, SettingsSlotEntry))

        // Wallpaper navigation on the keyboard. `shortcuts` is a declared
        // dependency: the dynamic client facade only exposes declared
        // services, and `ctx.inject` is not part of its verb set.
        // Linux defaults are omitted on purpose: `bindingIssue` only waves
        // arrow keys through on desktop Windows/macOS, so a Linux default
        // rejects the whole command ("Reserved shortcut default").
        const nextDefaults = {
          'desktop:windows': { code: 'ArrowRight', modifiers: ['primary', 'alt'] },
          'desktop:macos': { code: 'ArrowRight', modifiers: ['primary', 'alt', 'shift'] },
          'web:windows': { code: 'ArrowRight', modifiers: ['primary', 'alt'] },
          'web:macos': { code: 'ArrowRight', modifiers: ['primary', 'alt', 'shift'] },
        }
        const previousDefaults = {
          'desktop:windows': { code: 'ArrowLeft', modifiers: ['primary', 'alt'] },
          'desktop:macos': { code: 'ArrowLeft', modifiers: ['primary', 'alt', 'shift'] },
          'web:windows': { code: 'ArrowLeft', modifiers: ['primary', 'alt'] },
          'web:macos': { code: 'ArrowLeft', modifiers: ['primary', 'alt', 'shift'] },
        }
        const registerShortcut = (command) => {
          try {
            return { dispose: ctx.shortcuts.register(command), error: '' }
          } catch (error) {
            const message = errorText(error)
            shortcutFailure = message
            console.warn(`[${NS}] could not register ${command.id}`, error)
            return { dispose: () => {}, error: message }
          }
        }
        const nextRegistration = registerShortcut({
          id: 'dsh-skin-bg.next',
          label: () => t('shortcutNext'),
          aliases: ['background', 'wallpaper', 'next', '壁纸', '下一张'],
          defaults: nextDefaults,
          regions: ['page', 'editable'],
          modals: [],
          resolve: () => ({ status: 'handled', run: () => advance(1, false) }),
        })
        const previousRegistration = registerShortcut({
          id: 'dsh-skin-bg.previous',
          label: () => t('shortcutPrev'),
          aliases: ['background', 'wallpaper', 'previous', '壁纸', '上一张'],
          defaults: previousDefaults,
          regions: ['page', 'editable'],
          modals: [],
          resolve: () => ({ status: 'handled', run: () => advance(-1, false) }),
        })
        ctx.effect(() => nextRegistration.dispose)
        ctx.effect(() => previousRegistration.dispose)
      },
    }
  },
})
