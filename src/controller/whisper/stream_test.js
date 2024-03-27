import path from 'path'
import { fileURLToPath } from 'url'
import util from 'util'
import { createRequire } from 'module'
import dotenv from 'dotenv'

const projectPath = '../../..'
dotenv.config({
  path: path.join(projectPath, '.env')
})

const __fileName = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__fileName)

process.env.GGML_METAL_PATH_RESOURCES = path.resolve(
  __dirname,
  projectPath,
  process.env.GGML_METAL_PATH_RESOURCES
)

const __whisper_path = process.env.GGML_METAL_PATH_RESOURCES

// eslint-disable-next-line @typescript-eslint/no-var-requires
const require = createRequire(import.meta.url)

// 這邊 require 導出的內容，便是在 cpp 中 export.Set 的內容
// 在 stream 的話，就是 whisper_stream & stop_generation
const { start_generation, stop_generation } = require(
  path.join(__whisper_path, 'build/Release/whisper-stream')
)

const streamAsync = util.promisify(start_generation)

const whisperParams = {
  language: 'en',
  model: path.join(__whisper_path, 'models/ggml-base.en.bin'),
  // fname_inp: path.join(__whisper_path, 'samples/jfk.wav'),
  use_gpu: true,
  onProgress: (...args) => {
    const result = Array.from(args)
  }
}

// const argument = process.argv.slice(2)
// const params = Object.fromEntries(
//   argument.reduce((pre, item) => {
//     if (item.startsWith('--')) {
//       return [...pre, item.slice(2).split('=')]
//     }
//     return pre
//   }, [])
// )
// for (const key in params) {
//   if (whisperParams.hasOwnProperty(key)) {
//     whisperParams[key] = params[key]
//   }
// }

streamAsync(whisperParams).then(result => {
  console.log(`Result from whisper: ${result}`)
})
