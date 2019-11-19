export default function progress(el, shisa) {
  const name = 'data-progress'
  const bar = {
    buffer: null,
    play: null
  }
  el.classList.add('shisa_progress')

  Object.keys(bar).forEach(k => {
    bar[k] = document.createElement('div')
    bar[k].classList.add(`shisa_progress_${k}`)
    bar[k].setAttribute('aria-role', 'progressbar')
    bar[k].setAttribute('aria-readonly', '')
    bar[k].setAttribute('aria-valuemin', 0)
    bar[k].setAttribute('aria-valuemax', 1)
    el.append(bar[k])
    setWidth(bar[k], `${name}-${k}`, 0)
  })

  shisa.on('progress', () => {
    if (shisa.metadataIsFetched && shisa.duration) {
      const value = shisa.audio.buffered.length ? shisa.audio.buffered.end(shisa.audio.buffered.length - 1) / shisa.duration : 0
      setWidth(bar.buffer, `${name}-buffer`, value)
    }
  })

  shisa.on('loadedmetadata', () => {
    if (shisa.metadataIsFetched && shisa.duration) {
      const value = shisa.audio.currentTime / shisa.duration
      setWidth(bar.play, `${name}-play`, value)
    }
  })

  shisa.on('timeupdate', () => {
    if (shisa.metadataIsFetched && shisa.duration) {
      const value = shisa.audio.currentTime / shisa.duration
      setWidth(bar.play,`${name}-play`, value)
    }
  })

  shisa.on('ended', () => {
    shisa.shisa.audio.currentTime = 0
  })

  let initSeek = null
  let dragging = false
  const slider = document.createElement('input')
  slider.setAttribute(`${name}-slider`, '')
  el.append(slider)
  slider.type = 'range'
  slider.min = 0
  slider.max = 100
  slider.value = 0
  slider.step = 0.01

  slider.addEventListener('input', () => {
    if (!dragging) {
      dragging = true
    }
  })

  slider.addEventListener('change', () => {
    if (dragging) {
      dragging = false
    }
    if (shisa.metadataIsFetched && shisa.duration) {
      shisa.seek(slider.value / slider.max * shisa.duration)
      slider.setAttribute('value', slider.value)
    } else {
      initSeek = slider.value
    }
  })
  shisa.on('canplay', () => {
    if (initSeek && shisa.duration) {
      shisa.seek(initSeek / slider.max * shisa.duration)
      initSeek = null
    }
  })
  shisa.on('timeupdate', () => {
    if (!dragging) {
      slider.value = shisa.currentTime / shisa.duration * slider.max
      slider.setAttribute('value', slider.value)
    }
  })
 }

function setWidth(el, attr, value) {
  el.setAttribute(attr, value)
  el.style.width = `${value * 100}%`
  el.setAttribute('aria-valuenow', value)
}
