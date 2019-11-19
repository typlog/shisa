const _CONFIG = {
  forward: 15,
  backward: 15,
}

export default function seek(el, shisa) {
  const attr = Array.from(el.attributes).find(v => {
    return /data-seek-/.test(v.name)
  })
  if (!attr) return
  const direction = attr.name.slice(10)
  let step = attr.value

  if (direction === 'forward' || direction === 'backward') {
    step = step && !isNaN(+step) ? +step : _CONFIG[direction]
    attr.value = step
    step = direction === 'forward' ? step : - step
    el.addEventListener('click', () => {
      shisa.seek(shisa.currentTime + step)
    })
  }
}
