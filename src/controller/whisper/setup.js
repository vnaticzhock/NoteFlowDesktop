import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import util from 'util'

const __fileName = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__fileName)

const __whisper_path = path.join(__dirname, '../../../whisper.cpp')

// eslint-disable-next-line @typescript-eslint/no-var-requires
const require = createRequire(import.meta.url)
const { whisper } = require(
  path.join(__whisper_path, 'build/Electron/whisper-addon')
)

console.log(path.join(__whisper_path, 'build/Electron/whisper-addon'))

const whisperAsync = util.promisify(whisper)

const whisperParams = {
  language: 'en',
  model: path.join(__whisper_path, 'models/ggml-base.en.bin'),
  fname_inp: path.join(__whisper_path, 'samples/jfk.wav'),
  use_gpu: true
}

const argument = process.argv.slice(2)
const params = Object.fromEntries(
  argument.reduce((pre, item) => {
    if (item.startsWith('--')) {
      return [...pre, item.slice(2).split('=')]
    }
    return pre
  }, [])
)

for (const key in params) {
  if (whisperParams.hasOwnProperty(key)) {
    whisperParams[key] = params[key]
  }
}

console.log('whisperParams =', whisperParams)

whisperAsync(whisperParams).then(result => {
  console.log(`Result from whisper: ${result}`)
})
