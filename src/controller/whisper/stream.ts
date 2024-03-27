import path from 'path'
import { fileURLToPath } from 'url'
import util from 'util'
import { createRequire } from 'module'
import dotenv from 'dotenv'
import type { IWhisperParams } from '../../types/whisper/whisper.d.ts'
import type { MessageStream } from '../../types/extendWindow/chat.d.ts'
import { mainWindow } from '../../../main.js'

const projectPath = '../../..'
dotenv.config({
  path: path.join(projectPath, '.env')
})

const __fileName = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__fileName)

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

const whisperStartListening = (_, params: IWhisperParams): void => {
  const streamAsync = util.promisify(start_generation)
  const whisperParams = {
    ...params,
    onProgress: (...args: Array<string>): void => {
      const result = Array.from(args).join('')
      const response: MessageStream = {
        role: 'whisper',
        content: result,
        done: false
      }
      mainWindow.webContents.send('whisper-response', response)
    }
  }
  streamAsync(whisperParams).then(() => {
    const response: MessageStream = {
      role: 'whisper',
      content: '',
      done: true
    }
    mainWindow.webContents.send('whisper-response', response)
  })
}

const whisperStopListening = (): void => {
  stop_generation().then(() => {
    console.log('whisper is stopping from working.')
  })
}

export { whisperStartListening, whisperStopListening }
