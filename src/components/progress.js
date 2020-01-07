export default function progress(el, shisa) {
  const name = 'data-progress'
  const bar = {
    buffer: null,
    play: null
  }
  const dragEvent = new Event('drag')
  el.classList.add('shisa-progress')

  Object.keys(bar).forEach(k => {
    bar[k] = document.createElement('div')
    bar[k].classList.add(`shisa-progress_${k}`)
    bar[k].setAttribute('aria-role', 'progressbar')
    bar[k].setAttribute('aria-readonly', '')
    bar[k].setAttribute('aria-valuemin', 0)
    bar[k].setAttribute('aria-valuemax', 1)
    el.append(bar[k])
    setWidth(bar[k], 0)
  })

  shisa.on('progress', () => {
    if (shisa.metadataIsFetched && shisa.duration) {
      const value = shisa.audio.buffered.length ? shisa.audio.buffered.end(shisa.audio.buffered.length - 1) / shisa.duration : 0
      setWidth(bar.buffer, value)
    }
  })

  shisa.on('loadedmetadata', () => {
    if (shisa.metadataIsFetched && shisa.duration) {
      const value = shisa.audio.currentTime / shisa.duration
      setWidth(bar.play, value)
    }
  })

  shisa.on('timeupdate', () => {
    if (shisa.metadataIsFetched && shisa.duration) {
      const value = shisa.audio.currentTime / shisa.duration
      setWidth(bar.play, value)
    }
  })

  shisa.on('ended', () => {
    shisa.audio.currentTime = 0
  })

  const slider = document.createElement('input')
  slider.setAttribute(`${name}-slider`, '')
  slider.classList.add('shisa-progress_slider')
  el.append(slider)
  slider.type = 'range'
  slider.min = 0
  slider.max = 100
  slider.value = 0
  slider.step = 0.01


  slider.addEventListener('input', () => {
    shisa.progressTime = slider.value / slider.max * shisa.duration
    shisa.el.dispatchEvent(dragEvent)
    if (!shisa.dragging) {
      shisa.dragging = true
      slider.setAttribute('value', slider.value)
    }
  })

  slider.addEventListener('change', () => {
    if (shisa.dragging) {
      shisa.dragging = false
    }
    if (shisa.progressTime) {
      shisa.seek(shisa.progressTime)
      shisa.progressTime = null
    } else {
      shisa.initSeek = slider.value
    }
  })
  shisa.on('canplay', () => {
    if (shisa.initSeek && shisa.duration) {
      shisa.seek(shisa.initSeek / slider.max * shisa.duration)
      shisa.initSeek = null
    }
  })
  shisa.on('timeupdate', () => {
    if (!shisa.dragging) {
      slider.value = shisa.currentTime / shisa.duration * slider.max
      slider.setAttribute('value', slider.value)
    }
  })
 }

function setWidth(el, value) {
  el.style.width = `${value * 100}%`
  el.setAttribute('aria-valuenow', value)
}
