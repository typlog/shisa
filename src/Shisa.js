import Events from './events'

const COMPS = {
  play: controlPlay,
  mute: controlMute,
  speed: controlSpeed,
}

const audioConfig = {
  preload: 'none',
  autoplay: false,
  defaultMuted: false,
  defaultPlaybackRate: '1.0',
  speed: {
    min: 0.25,
    max: 5,
    step: 0.25,
  }
}

/*
<div data-shisa="play" data-play="playing">
  <button>play</button>
</div>
*/
class Shisa {
  constructor() {
    this.events = new Events()
    this.audio = new Audio()
  }

  register(name, fn) {
    if (!fn) {
      throw new Error(`Component ${name} is not properly registered.`)
    }
    COMPS[name] = fn
  }

  // render container
  render(el, src) {
    this.el = el
    this.audio.src= src
    this.initAudioConfigs(this.el, this.audio)

    const els = el.querySelectorAll('[data-shisa]')
    for (let i = 0; i< els.length; i++) {
      this.renderComponent(els[i], this.audio)
    }
    console.dir(this.audio)
    console.dir(this)
  }

  renderComponent(el, audio) {
    const name = el.getAttribute('data-shisa')
    const fn = COMPS[name]
    if (fn) {
      fn(el, audio, this)
    } else {
      // WIP
      this.defaultComponent(name, audio)
    }
  }

  initAudioConfigs(el, audio) {
    audio.preload = el.getAttribute('data-shisa-preload') || audioConfig.preload
    audio.autoplay = el.getAttribute('data-shisa-autoplay') || audioConfig.autoplay
    audio.defaultMuted = el.getAttribute('data-shisa-defaultMuted') || audioConfig.defaultMuted
    audio.defaultPlaybackRate = el.getAttribute('data-shisa-defaultPlaybackRate') || audioConfig.defaultPlaybackRate
  }

  get currentTime() {
    return this.audio.currentTime
  }
  // did not check input
  set currentTime(value) {
    this.audio.currentTime = value
  }

  get duration() {
    return this.audio.duration
  }
}

function controlPlay(el, audio, ctx) {
  const name = 'data-shisa-play'

  el.addEventListener('click', () => ctx.toggle())

  ctx.play = function (src) {
    if (src) {
      audio.src = src
    }
    if (!audio.paused) return
    const promise = this.audio.play()
    if (promise !== undefined) {
      promise.then(() => {
        el.setAttribute(name, 'play')
      })
      promise.catch((e) => {
        if (e.name === 'NotAllowedError' || e.name === 'NotSupportedError') {
          ctx.pause()
        }
      })
    }
  }

  ctx.pause = function() {
    if (audio.paused) return
    audio.pause()
    el.setAttribute(name, 'pause')
  }

  ctx.toggle = function() {
    audio.paused ? ctx.play() : ctx.pause()
  }
}

function controlMute(el, audio, ctx) {
  const name = 'data-shisa-muted'

  Object.defineProperty(ctx, 'muted', {
    get: function () {
      return this.audio.muted
    },
    set: function (value) {
      // did not check input
      this.audio.muted = value
      this.audio.muted ? el.setAttribute(name, '') : el.removeAttribute(name)
    },
  })

  let muted = el.getAttribute(name)
  if (muted === '') {
    ctx.muted = true
  }

  el.addEventListener('click', () => {
    ctx.muted = !ctx.muted
  })
}

function controlSpeed(el, audio, ctx) {
  const name = 'data-shisa-speed'

  Object.defineProperty(ctx, 'speed', {
    get: function () {
      return this.audio.playbackRate
    },
    set: function (value) {
      // checked input
      if (value && typeof +value === 'number') {
        this.audio.playbackRate = +value
        el.setAttribute(name, this.audio.playbackRate)
      }
    }
  })

  const speedData = {
    min: el.getAttribute(`${name}-min`),
    max: el.getAttribute(`${name}-max`),
    step: el.getAttribute(`${name}-step`),
  }
  const audioSpeed = Object.keys(speedData).reduce((arr, k) => {
    arr[k] = speedData[k] && !isNaN(+speedData[k]) ? +speedData[k] : audioConfig.speed[k]
    if (speedData[k] !== arr[k]) {
      el.setAttribute(`${name}-${k}`, arr[k])
    }
    return arr
  }, {})
  console.log('min, max, step', audioSpeed.min, audioSpeed.max, audioSpeed.step)


  let speed = el.getAttribute(name)
  if ((!speed || typeof +speed !== 'number') && speed !== 0) {
    speed = audio.defaultPlaybackRate
  }
  ctx.speed = Math.max(audioSpeed.min, Math.min(speed, audioSpeed.max))
  el.setAttribute(name, ctx.speed)

  const incrementEl = el.querySelector(`${name}-up`)
  const decrementEl = el.querySelector(`${name}-down`)
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

export default Shisa
