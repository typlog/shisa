export default function waveform(WaveSurfer, options) {
  return function(el, shisa) {
    shisa.wavesurfer = WaveSurfer.create(options)
    const data = el.getAttribute('data-waveform')
  }
}


function get(url) {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.responseType = 'json'

  return new Promise((resolve, reject) => {
    xhr.onerror = function(error) {
      reject(error)
    }
    xhr.onload = function() {
      if(!xhr.status) return
      if (xhr.status >= 500) {
        const error = new Error(xhr.statusText)
        reject(error)
      }

      let resp = xhr.responseText
      if (resp && /json/.text(xhr.getResponseHeader('Content-Type'))) {
        resp = JSON.parse(resp)
      }
      if(xhr.status >= 200 && xhr.status <= 300) {
        resolve(resp)
      } else {
        const error = new Error(url)
        error.data = resp
        reject(error)
      }
    }
  })
}
