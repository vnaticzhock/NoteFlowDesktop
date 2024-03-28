import path from 'path'
import { fileURLToPath } from 'url'
import util from 'util'
import { createRequire } from 'module'
import dotenv from 'dotenv'
import type { IWhisperParams } from '../../types/whisper/whisper.d.ts'
import type {
  MessageStream,
  WhisperStream
} from '../../types/extendWindow/chat.d.ts'
import { mainWindow } from '../../../main.js'

const projectPath = '../../..'
const __fileName = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__fileName)

dotenv.config({
  path: path.join(__dirname, projectPath, '.env')
})

process.env.GGML_METAL_PATH_RESOURCES = path.resolve(
  __dirname,
  projectPath,
  process.env.GGML_METAL_PATH_RESOURCES!
)

const __whisper_path = process.env.GGML_METAL_PATH_RESOURCES

const require = createRequire(import.meta.url)

const { start_generation, stop_generation } = require(
  path.join(__whisper_path, 'build/Release/whisper-stream')
)

const fetchParams = (): IWhisperParams => {
  return {
    language: 'en',
    model: path.join(__whisper_path, 'models/ggml-base.en.bin'),
    use_gpu: true
  }
}

const whisperStartListening = (): void => {
  const params = fetchParams()
  const streamAsync = util.promisify(start_generation)

  let current_chunk = 0
  const whisperParams = {
    ...params,
    onProgress: (...args: Array<string>): void => {
      const result = Array.from(args).join('')

      // non-VAD NEW LINE handler.
      if (result === '[NEW LINE]') {
        current_chunk += 1
        return
      }

      const response: WhisperStream = {
        role: 'whisper',
        content: result,
        done: false,
        chunk: current_chunk
      }
      mainWindow.webContents.send('whisper-response', response)
    }
  }
  streamAsync(whisperParams).then(res => {
    const response: WhisperStream = {
      role: 'whisper',
      content: '',
      done: true,
      chunk: -1
    }
    mainWindow.webContents.send('whisper-response', response)
  })
}

const whisperStopListening = (): void => {
  stop_generation()
  console.log('whisper is stopping from working. (async)')
}

export { whisperStartListening, whisperStopListening }
