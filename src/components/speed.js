const _CONFIG = {
  min: 0.25,
  max: 5,
  step: 0.25,
}

export default function speed(el, audio, ctx, options = {}) {
  const name = 'data-shisa-speed'

  const speedData = {
    min: el.getAttribute(`${name}-min`),
    max: el.getAttribute(`${name}-max`),
    step: el.getAttribute(`${name}-step`),
  }
  const audioSpeed = Object.keys(speedData).reduce((arr, k) => {
    arr[k] = speedData[k] && !isNaN(+speedData[k]) ? +speedData[k] : options[k] || _CONFIG[k]
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
