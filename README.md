<div align="center">

<img src="icon.svg" width="88" height="88" alt="dsh-skin" />

# dsh-skin

**给 DeepSeek Harness 界面铺一层壁纸的插件。**

图床直链、本地图片、Wallpaper Engine 库都能当壁纸，配合透明度、模糊、轮播和快捷键，把工作台变成你自己的桌面。

[功能](#-功能) · [安装](#-安装) · [使用](#-使用) · [配置](#-配置项) · [实现](#-实现) · [开发](#-开发) · [English](#english)

</div>

---

## ✨ 功能

- **三种壁纸来源**
  - **图床链接**：每行一个 `https://…` 直链，jpg / png / webp / gif / avif 甚至 mp4 视频都行；可把图片缓存到本地，避免每次刷新都重新下载。
  - **本地图片**：填单个文件或整个目录，也可以在设置里点「选择文件夹」直接导入（导入的是副本，原文件不动）。
  - **Wallpaper Engine**：指向创意工坊 `431960` 目录或任意已下载壁纸目录，自动扫描里面的图片和视频，视频会静音循环播放。
- **一眼好看的外观**：壁纸透明度、高斯模糊、界面不透明度（让侧边栏和面板半透明，壁纸透出来）三个滑杆，只看你想看的那一层。
- **轮播**：可设 3 秒～24 小时的切换间隔，可随机播放，可交叉淡入淡出；视频可以「播完自动切」或「循环播放」。
- **键盘快捷键**：上一张 / 下一张，默认 `Ctrl+Alt+←` 和 `Ctrl+Alt+→`（macOS 为 `⌘+⌥+Shift`），支持在 设置 → 通用 → 快捷键 里改键。
- **中英双语**，跟随 DSH 的语言设置。
- **纯本地**：不联网、不上传、不统计；只有你主动添加的图床地址会被请求。

## 📦 安装

> 需要 DeepSeek Harness（桌面版或 `dsh web`）带有 `webServer` 服务，插件本体只在 Web UI 上渲染。

### 方式一：从 GitHub 安装（推荐）

DSH 的插件是装在 **profile** 里的普通 npm 包。找到你的 profile 目录（默认 `~/.dsh/profiles/desktop`，Windows 下是 `%USERPROFILE%\.dsh\profiles\desktop`），执行：

```bash
cd "$HOME/.dsh/profiles/desktop"
pnpm add github:Avan0203/dsh-skin
```

然后编辑同目录的 `package.json`，把包名加进 `dsh.profile.bundles`：

```json
{
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dsh-skin"
      ]
    }
  }
}
```

重启 DSH，打开 **设置 → 背景壁纸** 即可。

### 方式二：用 Release 里的压缩包

从 [Releases](https://github.com/Avan0203/dsh-skin/releases) 下载最新的 `dsh-skin-<版本>.tgz`（若该版本没附带压缩包，用方式一，或 GitHub 自动生成的 Source code 压缩包），同样放进 profile：

```bash
cd "$HOME/.dsh/profiles/desktop"
pnpm add ./dsh-skin-1.0.1.tgz
```

并同样把 `"dsh-skin"` 加进 `dsh.profile.bundles`，重启 DSH。

### 方式三：本地开发（link）

想改代码又不想每次打包：

```bash
git clone https://github.com/Avan0203/dsh-skin.git
cd "$HOME/.dsh/profiles/desktop"
pnpm add link:/绝对路径/dsh-skin
```

再把 `"dsh-skin"` 加入 `dsh.profile.bundles` 并重启。之后改 `client.js` 刷新页面即可生效，改 `index.js`（Host 半边）需要重启 DSH。

## 🖼 使用

打开 **设置 → 背景壁纸**：

| 分区 | 你可以做什么 |
| --- | --- |
| **图片来源** | 在「图床链接 / 本地图片 / Wallpaper Engine」之间切换；三选一，切换后立即重新加载。 |
| **图床链接** | 粘贴直链、开关本地缓存、指定缓存目录。 |
| **本地图片** | 添加文件或目录、点「选择文件夹」批量导入、在缩略图里点选或删除单张。 |
| **Wallpaper Engine** | 填创意工坊目录并「重新扫描」。 |
| **外观** | 背景图透明度、界面不透明度、模糊程度。 |
| **播放** | 轮播间隔、随机播放、淡入淡出时长、视频播完自动切换、视频默认静音。 |
| **控制** | 上一张 / 下一张 / 暂停轮播，以及当前播放进度。 |

小提示：

- 「界面不透明度」调到 100 时界面完全不透明，壁纸只在边缘透出来；调到 40~70 最好看。设置弹窗始终保持不透明，不影响阅读。
- 图床地址每次请求可能返回不同的图片，所以图床来源按顺序轮播，**随机播放只对本地图片和 Wallpaper Engine 库生效**。
- 视频不循环、播完切下一张时，轮播间隔对视频不生效，由视频时长决定。

## ⚙️ 配置项

设置保存在 `$DSH_HOME/data/dsh-skin/config.json`，也可以直接改这个文件（改完重启 DSH 或打开设置页保存一次）。

| 字段 | 默认值 | 范围 / 取值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `true` | 布尔 | 关闭后立即移除壁纸层。 |
| `source` | `"urls"` | `urls` / `local` / `wallpaper` | 当前使用的来源。 |
| `urls` | `[]` | 最多 100 条 | 图床直链。 |
| `folders` | `[]` | 最多 50 条 | 本地图片 / 视频目录。 |
| `files` | `[]` | 最多 200 条 | 本地单个媒体文件。 |
| `hidden` | `[]` | 最多 1000 条 | 已隐藏（删除）的条目。 |
| `cacheUrls` | `true` | 布尔 | 是否把图床图片缓存到本地。 |
| `cacheDir` | `""` | 路径 | 缓存目录，留空用 `$DSH_HOME/data/dsh-skin/library`。 |
| `wallpaperDir` | `""` | 路径 | Wallpaper Engine 创意工坊目录。 |
| `opacity` | `100` | 0–100 | 壁纸本身的透明度。 |
| `surfaceOpacity` | `62` | 0–100 | 主界面面板的不透明度，越低壁纸越明显。 |
| `blur` | `0` | 0–80 | 壁纸的高斯模糊（像素）。 |
| `intervalSec` | `30` | 3–86400 | 轮播间隔（秒）。 |
| `random` | `false` | 布尔 | 随机播放。 |
| `advanceOnEnd` | `true` | 布尔 | 视频播完自动切下一张。 |
| `videoMuted` | `true` | 布尔 | 视频默认静音（被浏览器拦截自动播放时会自动回退静音）。 |
| `fadeSec` | `1.2` | 0–5 | 两张壁纸交叉淡入淡出时长（秒）。 |

支持的格式：图片 `png jpg jpeg jfif webp gif avif bmp svg`，视频 `mp4 webm ogv mov m4v`。

## 🧩 实现

插件分成两半，各管一件事：

```
dsh-skin/
├── index.js           # Host 半边：持久化配置 + 以同源 HTTP 路由供媒体文件
├── client.js          # 浏览器半边：壁纸层、轮播、设置页、快捷键
├── cordis.patch.yml   # 往 profile 里 insert 这个 bundle
├── locale/{zh,en}.json
└── icon.svg
```

**为什么要 Host 半边？** Web UI 跑在 `http://127.0.0.1:<port>` 上，浏览器读不了 `file://` 路径；而 `localStorage` 会因为端口变化而失效。所以：

1. Host 用 `$DSH_HOME/data/dsh-skin/config.json` 持久化设置；
2. Host 通过同源路由把配置里指向的本地媒体文件流式发给浏览器（支持 `Range`，视频可以拖动播放）。

HTTP 路由（均挂在 `/plugin-skin` 前缀下）：

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/plugin-skin/state` | 读配置 + 当前播放列表，`?refresh=1` 强制重扫目录。 |
| `POST` | `/plugin-skin/config` | 保存整份配置（JSON），立即重建播放列表。 |
| `GET`/`HEAD` | `/plugin-skin/media?path=…` | 流式读取本地媒体文件。 |
| `GET`/`HEAD` | `/plugin-skin/remote?url=…` | 代理并缓存图床图片；缓存失败时 302 回原地址。 |
| `POST` | `/plugin-skin/upload?name=…` | 「选择文件夹」导入时把文件写入缓存目录。 |

安全边界：

- `media` 路由只允许读取当前配置里声明过的目录/文件（`source` 决定白名单），其余路径返回 403；
- 只放行白名单内的图片/视频扩展名，其他一律 415；
- 单文件上传/远程下载上限 64 MB，远程请求 20 秒超时；
- 目录扫描最多 4 层、4000 个条目，单次导入最多 200 个文件。

## 🛠 开发

仓库就是插件包本身（`package.json` 里的 `dsh` 字段告诉 DSH 怎么加载它），没有构建步骤：

```bash
npm run check   # 语法自检
npm run pack    # 打包成 dist/dsh-skin-<version>.tgz
```

本地调试时用 `link:` 安装（见「方式三」），改完 `client.js` 刷新页面，改完 `index.js` 重启 DSH。

## ❓ 常见问题

**点了「上一张 / 下一张」没反应？**
先看面板底部「当前 x/y」。三种来源是**互斥**的，只使用当前选中的那一个：

- 如果你导入过本地图片，要点一下「本地图片」标签，列表才会变成那些图；
- 图床只有一个地址、并且开着「缓存图床图片到本地」时，来回切都是同一张缓存图——要每次取新图就关掉缓存，或者多加几个地址；
- 只有 1 张可用壁纸时，面板会直接给出提示，而不是默默无反应。

**壁纸不显示？**
确认「启用背景」是开的、来源不是空的；如果图片被移动或删除，面板底部会列出失败的来源。

**改代码后没生效？**
改 `client.js` 刷新页面即可；改 `index.js`（Host 半边）必须重启 DSH。

## 📄 License

[MIT](LICENSE) © Avan0203

---

## English

**dsh-skin** paints a wallpaper behind the whole DeepSeek Harness UI — from image URLs, local files, or a Wallpaper Engine workshop folder.

- **Sources:** image/video URLs (optionally cached to disk), local files and folders, Wallpaper Engine `431960` libraries.
- **Look:** wallpaper opacity, Gaussian blur, and a translucent-UI opacity so panels and sidebar let the wallpaper through. Dialogs stay opaque.
- **Playback:** interval (3 s – 24 h), random order, cross-fade, video auto-advance or loop, muted by default.
- **Shortcuts:** previous / next wallpaper, default `Ctrl+Alt+←/→` (`⌘+⌥+Shift` on macOS), rebindable in Settings → General → Shortcuts.
- **Bilingual** (中文 / English), fully local — nothing is uploaded anywhere.

### Install

```bash
cd "$HOME/.dsh/profiles/desktop"      # your DSH profile
pnpm add github:Avan0203/dsh-skin
```

Add `"dsh-skin"` to `dsh.profile.bundles` in that profile's `package.json`, restart DSH, then open **Settings → Background Wallpaper**.

Requires a DSH build providing the `webServer` service. Settings live in `$DSH_HOME/data/dsh-skin/config.json`.

### License

MIT © Avan0203
