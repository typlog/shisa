const _CONFIG = {
  seekable: true,
  hasBuffer: true,
}

export default function progress(el, audio, ctx, options = {}) {
  const name = 'data-shisa-progress'
  handleOptions(options)

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
}

function handleOptions(options) {
  options.seekable = options.seekable === undefined ? _CONFIG.seekable : options.seekable
  options.showBuffer = options.showBuffer === undefined ? _CONFIG.showBuffer : options.showBuffer
}
