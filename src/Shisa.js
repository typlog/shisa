import Events from './events'
import play from './components/play'
import mute from './components/mute'
import speed from './components/speed'
import buffering from './components/buffering'
import time from './components/time'
import seek from './components/seek'
import progress from './components/progress'

const BUILTIN_COMPS = {
  play,
  mute,
  speed,
  buffering,
  time,
  seek,
  progress,
}

const REGISTERED_COMPS = {}

const DEFAULT_AUDIO_CONFIG = {
  preload: 'metadata',
  autoplay: false,
  defaultMuted: false,
  defaultPlaybackRate: '1.0',
}

class Shisa {
  constructor(el, src, options = {}) {
    this.el = el
    this.el.classList.add('shisa')
    this.events = new Events()
    this.audio = new Audio()
    this.audio.src = src
    this.metadataIsFetched = false
    this._initOptions(options)
    this._clearDOM()

    const els = this.el.querySelectorAll('[data-shisa]')
    for (let i = 0; i < els.length; i++) {
      this._renderComponent(els[i], this.audio)
    }

    this._initEvents()
    this.events.audioEvents.forEach(name => {
      this.audio.addEventListener(name, (e) => {
        this.events.trigger(name, e)
      })
    })
  }

  _renderComponent(el) {
    const name = el.getAttribute('data-shisa')
    const fn = BUILTIN_COMPS[name] || REGISTERED_COMPS[name]
    if (fn) {
      fn(el, this)
    }
  }

  _initOptions(options) {
    this.audio.preload = options.preload || DEFAULT_AUDIO_CONFIG.preload
    this.audio.autoplay = options.autoplay || DEFAULT_AUDIO_CONFIG.autoplay
    this.audio.defaultMuted = options.defaultMuted || DEFAULT_AUDIO_CONFIG.defaultMuted
    this.audio.defaultPlaybackRate = options.defaultPlaybackRate || DEFAULT_AUDIO_CONFIG.defaultPlaybackRate
  }

  _clearDOM() {
    const els = this.el.querySelectorAll('audio')
    for (let i = 0; i < els.length; i++) {
      els[i].remove()
    }
  }

  _initEvents() {
    this.on('loadedmetadata', () => {
      this.metadataIsFetched = true
    })
  }

  on(name, callback) {
    this.events.on(name, callback)
  }

  get currentTime() {
    return this.audio.currentTime
  }

  set currentTime(value) {
    this.audio.currentTime = value
  }

  get duration() {
    return this.audio.duration
  }

  get muted() {
    return this.audio.muted
  }

  set muted(value) {
    this.audio.muted = value
  }

  get speed() {
    return this.audio.playbackRate
  }

  set speed(value) {
    if (value && typeof +value === 'number') {
      this.audio.playbackRate = +value
    }
  }

  seek(time) {
    time = parseInt(time)
    if (isNaN(time) || !isFinite(time)) {
      throw new Error('Seeking time is not a valid number.')
    } else {
      this.currentTime = time
    }
  }

  play(src) {
    if (src) {
      this.audio.src = src
    }
    if (!this.audio.paused) return
    const promise = this.audio.play()
    if (promise !== undefined) {
      promise.catch((e) => {
        if (e.name === 'NotAllowedError' || e.name === 'NotSupportedError') {
          this.pause()
        }
      })
    }
  }

  pause() {
    if (this.audio.paused) return
    this.audio.pause()
  }

  destroy() {
    this.audio.pause()
    this.audio.src = ''
    this.audio.load()
    this.audio = null
  }
}

Shisa.register = function(name, fn) {
  REGISTERED_COMPS[name] = fn
}

export default Shisa
