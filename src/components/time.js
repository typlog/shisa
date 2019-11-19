export default function controlTime(el, shisa) {
  el.classList.add('shisa-time')
  const attr = Array.from(el.attributes).find(v => {
    return /data-time-/.test(v.name)
  })
  if (!attr) return

  const type = attr.name.slice(10)
  if (type === 'current') {
    attr.value = el.textContent = secondToTime(shisa.currentTime)
    el.classList.add('shisa-time_current')
    shisa.on('timeupdate', () => {
      attr.value = el.textContent = secondToTime(shisa.currentTime)
    })
  } else if (type === 'duration') {
    attr.value = el.textContent = '--:--'
    el.classList.add('shisa-time_duration')
    shisa.on('loadedmetadata', () => {
      if (shisa.metadataIsFetched && shisa.duration) {
        attr.value = el.textContent = secondToTime(shisa.duration)
      }
    })
    shisa.on('durationchange', () => {
      if (shisa.duration !== -1) {
        attr.value = el.textContent = secondToTime(shisa.duration)
      }
    })
  }
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
