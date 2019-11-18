const _CONFIG = {
  seekable: true,
  showBuffer: true,
  progress: true,
}

export default function progress(el, audio, ctx, options = {}) {
  const name = 'data-progress'
  handleOptions(options)
  const barPlayed = options.progress ? document.createElement('progress') : document.createElement('div')
  barPlayed.setAttribute(`${name}-played`, '')
  el.append(barPlayed)

  if (options.progress) {
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
  } else {
    barPlayed.setAttribute(`${name}-played-value`, 0)

    ctx.on('loadedmetadata', () => {
      if (ctx.metadataIsFetched && ctx.duration) {
        barPlayed.setAttribute(`${name}-played-value`, audio.currentTime / ctx.duration * 100)
      }
    })

    ctx.on('timeupdate', () => {
      if (ctx.metadataIsFetched && ctx.duration) {
        barPlayed.setAttribute(`${name}-played-value`, audio.currentTime / ctx.duration * 100)
      }
    })
  }

  ctx.on('ended', () => {
    audio.currentTime = 0
  })

  if (options.showBuffer) {
    let barBuffered = options.progress ? document.createElement('progress') : document.createElement('div')
    barBuffered.setAttribute(`${name}-buffered`, '')
    el.append(barBuffered)

    if (options.progress) {
      barBuffered.max = 100
      barBuffered.value = 0

      ctx.on('progress', () => {
        if (ctx.metadataIsFetched && ctx.duration) {
          barBuffered.value = audio.buffered.length ? audio.buffered.end(audio.buffered.length - 1) / ctx.duration * barBuffered.max : 0
        }
      })
    } else {
      barBuffered.setAttribute(`${name}-buffered-value`, 0)

      ctx.on('progress', () => {
        if (ctx.metadataIsFetched && ctx.duration) {
          const value = audio.buffered.length ? audio.buffered.end(audio.buffered.length - 1) / ctx.duration * 100 : 0
          barBuffered.setAttribute(`${name}-buffered-value`, value)
        }
      })
    }
  }

  if (options.seekable) {
    let initSeek = null
    let dragging = false
    const slider = document.createElement('input')
    slider.setAttribute(`${name}-slider`, '')
    el.append(slider)
    slider.type = 'range'
    slider.min = 0
    slider.max = 100
    slider.value = 0

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
  options.progress = options.progress === undefined ? _CONFIG.progress : options.progress
}
