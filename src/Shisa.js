import Events from './events'

const COMPS = {
  play: controlPlay,
  mute: controlMute,
  speed: controlSpeed,
  buffering: controlBuffering,
  progress: controlProgress,
  seek: controlSeek,
  time: controlTime,
}

const audioConfig = {
  preload: 'metadata',
  autoplay: false,
  defaultMuted: false,
  defaultPlaybackRate: '1.0',
}

class Shisa {
  constructor(options) {
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

  register(name, fn, options) {
    if (!fn) {
      throw new Error(`Component ${name} is not properly registered.`)
    }
    COMPS[name] = () => { fn(options) }
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

function controlPlay(el, audio, ctx) {
  const name = 'data-shisa-play'
  el.addEventListener('click', () => toggle())

  ctx.on('play', () => {
    el.setAttribute(name, 'play')
  })
  ctx.on('pause', () => {
    el.setAttribute(name, 'pause')
  })

  function toggle() {
    audio.paused ? ctx.play() : ctx.pause()
  }
}

function controlMute(el, audio, ctx) {
  const name = 'data-shisa-muted'
  let muted = el.getAttribute(name)
  if (muted === '') {
    ctx.muted = true

  }

  el.addEventListener('click', () => {
    ctx.muted = !ctx.muted
    ctx.muted ? el.setAttribute(name, '') : el.removeAttribute(name)
  })
}

const _SPEED_CONFIG = {
  min: 0.25,
  max: 5,
  step: 0.25,
}

function controlSpeed(el, audio, ctx, options = {}) {
  const name = 'data-shisa-speed'

  const speedData = {
    min: el.getAttribute(`${name}-min`),
    max: el.getAttribute(`${name}-max`),
    step: el.getAttribute(`${name}-step`),
  }
  const audioSpeed = Object.keys(speedData).reduce((arr, k) => {
    arr[k] = speedData[k] && !isNaN(+speedData[k]) ? +speedData[k] : options[k] || _SPEED_CONFIG[k]
    if (speedData[k] !== arr[k]) {
      el.setAttribute(`${name}-${k}`, arr[k])
    }
    return arr
  }, {})


  let speed = el.getAttribute(name)
  if ((!speed || typeof +speed !== 'number') && speed !== 0) {
    speed = audio.defaultPlaybackRate
  }
  ctx.speed = Math.max(audioSpeed.min, Math.min(speed, audioSpeed.max))
  el.setAttribute(name, ctx.speed)

  const incrementEl = el.querySelector(`[${name}-up]`)
  const decrementEl = el.querySelector(`[${name}-down]`)
  if (!incrementEl && !decrementEl) {
    el.addEventListener('click', () => {
      ctx.speed = ctx.speed === audioSpeed.max ? audioSpeed.min : Math.min(audioSpeed.max, Math.max(audioSpeed.min, ctx.speed + audioSpeed.step))
      el.setAttribute(name, ctx.speed)
    })
  }
  if (incrementEl) {
    incrementEl.addEventListener('click', () => {
      ctx.speed = Math.min(audioSpeed.max, Math.max(audioSpeed.min, ctx.speed + audioSpeed.step))
      el.setAttribute(name, ctx.speed)
    })
  }
  if (decrementEl) {
    decrementEl.addEventListener('click', () => {
      ctx.speed = Math.min(audioSpeed.max, Math.max(audioSpeed.min, ctx.speed - audioSpeed.step))
      el.setAttribute(name, ctx.speed)
    })
  }
}

function controlBuffering(el, audio, ctx) {
  const name = 'data-shisa-buffering'
  ctx.on('canplaythrough', () => {
    el.removeAttribute(name)
  })
  ctx.on('waiting', () => {
    el.setAttribute(name, '')
  })
  ctx.on('seeking', () => {
    el.setAttribute(name, '')
  })
}

function controlProgress(el, audio, ctx, options = {}) {
  const name = 'data-shisa-progress'
  handleOptions()

  let barPlayed = el.querySelector(`progress[${name}-played]`)
  if (!barPlayed) {
    barPlayed = document.createElement('progress')
    barPlayed.setAttribute(`${name}-played`, '')
    el.append(barPlayed)
  }
  barPlayed.max = 100
  barPlayed.value = 0
  ctx.on('loadedmetadata', () => {
    if (ctx.metadataIsFetched && ctx.duration) {
      barPlayed.value = audio.currentTime / ctx.duration * barPlayed.max
    }
  })

  ctx.on('timeupdate', () => {
    if (ctx.metadataIsFetched && ctx.duration) {
      barPlayed.value = audio.currentTime / ctx.duration * barPlayed.max
    }
  })
  ctx.on('ended', () => {
    audio.currentTime = 0
  })


  if (options.showBuffer) {
    let barBuffered = el.querySelector(`progress[${name}-buffered]`)
    if (!barBuffered) {
      barBuffered = document.createElement('progress')
      barBuffered.setAttribute(`${name}-buffered`, '')
      el.append(barBuffered)
    }
    barBuffered.max = '100'
    barBuffered.value = 0

    ctx.on('progress', () => {
      if (ctx.metadataIsFetched && ctx.duration) {
        barBuffered.value = audio.buffered.length ? audio.buffered.end(audio.buffered.length - 1) / ctx.duration * barBuffered.max : 0
      }
    })
  }

  if (options.seekable) {
    let initSeek = null
    let dragging = false
    let slider = el.querySelector(`input[${name}-slider]`)
    if (!slider) {
      slider = document.createElement('input')
      slider.setAttribute(`${name}-slider`, '')
      el.append(slider)
    }
    slider.type = 'range'
    slider.min = '0'
    slider.max = '100'

    if (slider.getAttribute('value') !== null) {
      ctx.on('loadedmetadata', () => {
        if (ctx.metadataIsFetched && ctx.duration) {
          ctx.seek(barPlayed.value / barPlayed.max * ctx.duration)
        }
      })
    } else {
      slider.value = 0
      slider.setAttribute('value', slider.value)
    }
    slider.addEventListener('input', () => {
      if (!dragging) {
        dragging = true
      }
    })

    slider.addEventListener('change', () => {
      if (dragging) {
        dragging = false
      }
      if (ctx.metadataIsFetched && ctx.duration) {
        ctx.seek(slider.value / slider.max * ctx.duration)
        slider.setAttribute('value', slider.value)
      } else {
        initSeek = slider.value
      }
    })
    ctx.on('canplay', () => {
      if (initSeek && ctx.duration) {
        ctx.seek(initSeek / slider.max * ctx.duration)
        initSeek = null
      }
    })
    ctx.on('timeupdate', () => {
      if (!dragging) {
        slider.value = ctx.currentTime / ctx.duration * slider.max
        slider.setAttribute('value', slider.value)
      }
    })
  }

  function handleOptions() {
    options.seekable = options.seekable === undefined ? true : options.seekable
    options.showBuffer = options.showBuffer === undefined ? true : options.showBuffer
  }
}

const _CONFIG = {
  forward: 15,
  backward: 15,
}

function controlSeek(el, audio, ctx, options = {}) {
  const name = 'data-shisa-seek'
  const seekForward = el.querySelector(`[${name}-forward]`)
  const seekBackward = el.querySelector(`[${name}-backward]`)

  if (seekForward) {
    let forwardTime = seekForward.getAttribute(`${name}-forward`)
    forwardTime = forwardTime && !isNaN(+forwardTime) ? +forwardTime : options.forward || _CONFIG.forward
    seekForward.setAttribute(`${name}-forward`, forwardTime)

    seekForward.addEventListener('click', () => {
      ctx.seek(ctx.currentTime + forwardTime)
    })
  }

  if (seekBackward) {
    let backwardTime = seekBackward.getAttribute(`${name}-backward`)
    backwardTime = backwardTime && !isNaN(+backwardTime) ? +backwardTime : options.backward || _CONFIG.backward
    seekBackward.setAttribute(`${name}-backward`, backwardTime)

    seekBackward.addEventListener('click', () => {
      ctx.seek(ctx.currentTime - backwardTime)
    })
  }
}

function controlTime(el, audio, ctx) {
  const name = 'data-shisa-time'
  const current = el.querySelector(`[${name}-current]`)
  const duration = el.querySelector(`[${name}-duration]`)

  if (current) {
    current.setAttribute(`${name}-current`, '00:00')
    ctx.on('timeupdate', () => {
      current.setAttribute(`${name}-current`, secondToTime(ctx.currentTime))
    })
  }

  if (duration) {
    duration.setAttribute(`${name}-duration`, '--:--')
    ctx.on('loadedmetadata', () => {
      if (ctx.metadataIsFetched && ctx.duration) {
        duration.setAttribute(`${name}-duration`, secondToTime(ctx.duration))
      }
    })
  }

  function secondToTime(time) {
    time = Math.round(time)
    let hour = Math.floor(time / 3600)
    let min = Math.floor((time - hour * 3600) / 60)
    let sec = Math.floor(time - hour * 3600 - min * 60)
    min = min < 10 ? '0' + min : min
    sec = sec < 10 ? '0' + sec : sec
    if (hour === 0) {
      hour = hour < 10 ? '0' + hour : hour
      return `${min}:${sec}`
    }
    return `${hour}:${min}:${sec}`
  }
}


export default Shisa
