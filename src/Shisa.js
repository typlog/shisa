import Events from './events'
import play from './components/play'
import mute from './components/mute'
import speed from './components/speed'
import buffering from './components/buffering'
import time from './components/time'
import seek from './components/seek'
import progress from './components/progress'

const COMPS = {
  play,
  mute,
  speed,
  buffering,
  time,
  seek,
  progress,
}

const audioConfig = {
  preload: 'metadata',
  autoplay: false,
  defaultMuted: false,
  defaultPlaybackRate: '1.0',
}

class Shisa {
  constructor(options = {}) {
    this.options = options || audioConfig
    this.events = new Events()
    this.audio = new Audio()
    this.metadataIsFetched = false
    this.events.audioEvents.forEach(name => {
      this.audio.addEventListener(name, (e) => {
        this.events.trigger(name, e)
      })
    })
    this.initEvents()
  }

  render(el, src) {
    this.el = el
    this.initAudioConfigs(this.el, this.audio)
    this.audio.src = src

    const els = el.querySelectorAll('[data-shisa]')
    for (let i = 0; i< els.length; i++) {
      this.renderComponent(els[i], this.audio)
    }
  }

  renderComponent(el, audio) {
    const name = el.getAttribute('data-shisa')
    const fn = COMPS[name]
    if (fn) {
      fn(el, audio, this)
    }
  }

  on(name, callback) {
    this.events.on(name, callback)
  }

  initAudioConfigs() {
    this.audio.preload = this.el.getAttribute('data-shisa-preload') || this.options.preload || audioConfig.preload
    this.audio.autoplay = this.el.getAttribute('data-shisa-autoplay') || this.options.autoplay || audioConfig.autoplay
    this.audio.defaultMuted = this.el.getAttribute('data-shisa-defaultMuted') || this.options.defaultMuted || audioConfig.defaultMuted
    this.audio.defaultPlaybackRate = this.el.getAttribute('data-shisa-defaultPlaybackRate') || this.options.defaultPlaybackRate || audioConfig.defaultPlaybackRate
  }

  initEvents() {
    this.on('loadedmetadata', () => {
      this.metadataIsFetched = true
    })
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
}

Shisa.register = function(name, fn, options) {
  if (!fn) {
    throw new Error(`Component ${name} is not properly registered.`)
  }
  COMPS[name] = (el, audio, ctx) => {
    fn(el, audio, ctx, options)
  }
}

export default Shisa
