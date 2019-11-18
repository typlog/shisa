const _CONFIG = {
  min: 0.25,
  max: 5,
  step: 0.25,
}

export default function speed(el, audio, ctx, options = {}) {
  const name = 'data-speed'

  ctx.on('ratechange', () => {
    el.setAttribute(name, ctx.speed)
    el.textContent = numToString(ctx.speed)
  })

  const rawData = {
    min: el.getAttribute(`${name}-min`),
    max: el.getAttribute(`${name}-max`),
    step: el.getAttribute(`${name}-step`),
  }

  const speedOptions = Object.keys(rawData).reduce((arr, k) => {
    arr[k] = rawData[k] && !isNaN(+rawData[k]) ? +rawData[k] : options[k] || _CONFIG[k]
    if (rawData[k] !== arr[k]) {
      el.setAttribute(`${name}-${k}`, arr[k])
    }
    return arr
  }, {})

  let speed = el.getAttribute(name)
  if ((!speed || typeof +speed !== 'number') && speed !== 0) {
    speed = audio.defaultPlaybackRate
  }
  ctx.speed = Math.max(speedOptions.min, Math.min(speed, speedOptions.max))
  el.textContent = numToString(ctx.speed)

  el.addEventListener('click', () => {
    ctx.speed = ctx.speed === speedOptions.max ? speedOptions.min : Math.min(speedOptions.max, Math.max(speedOptions.min, ctx.speed + speedOptions.step))
  })
}

function numToString(num) {
  const float = parseFloat(num).toFixed(2)
  return float.slice(-1) === '0' ? float.slice(0, -1) : float
}
