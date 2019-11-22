const fs = require('fs')
const postcss = require('postcss')
const atImport = require('postcss-import')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

async function build(name) {
  console.log('building: ', name)
  const fromFile = `src/css/${name}`
  const toFile = `dist/${name}`
  const rawCSS = fs.readFileSync(fromFile, 'utf8')
  const resp = await postcss([
    atImport(),
    autoprefixer(),
    cssnano({
      preset: ['default']
    })
  ]).process(rawCSS, {
    from: fromFile,
    to: toFile,
  })
  fs.writeFileSync(toFile, resp.css)
}

async function run(names) {
  names.forEach(async name => {
    await build(name)
  })
}

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}
run(fs.readdirSync('src/css').filter(name => {
  return /\.css$/.test(name)
}))

