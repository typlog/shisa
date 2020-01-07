import Events from './events'
import play from './components/play'
import mute from './components/mute'
import speed from './components/speed'
import spinner from './components/spinner'
import time from './components/time'
import seek from './components/seek'
import progress from './components/progress'

const BUILTIN_COMPS = {
  play,
  mute,
  speed,
  spinner,
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
    this.initDuration = NaN
    this.initSeek = null
    this.dragging = false
    this.events = new Events()
    this.audio = new Audio()
    Object.assign(this.audio, DEFAULT_AUDIO_CONFIG, options)
    this.audio.src = src
    this.el.classList.add('shisa_ready')
    this.metadataIsFetched = false

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
    this.events.playerEvents.forEach(name => {
      this.el.addEventListener(name, (e) => {
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
    if (this.audio.duration) {
      return this.audio.duration
    } else {
      return this.initDuration
    }
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
