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
import { fetchConfig } from '../llms/parameters.js'

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

const { whisper } = require(
  path.join(__whisper_path, 'build/Release/whisper-addon')
)

const fetchParams = (): any => {
  const configs = fetchConfig('', 'whisper')

  const language = configs.default_model.includes('en') ? 'en' : 'auto'

  return {
    language: language,
    model: path.join(
      __whisper_path,
      `models/ggml-${configs.default_model}.bin`
    ),
    use_gpu: true
    // length_ms: configs.length_ms,
    // step_ms: configs.step_ms,
    // keep_ms: configs.keep_ms,
    // max_tokens: configs.max_tokens_in_stream,
    // vad_threshold: configs.vad_threshold,
    // no_timestamps: configs.no_timestamps
  }
}

const whisperTask = async (_, file_name: string): Promise<any> => {
  const whisperParams = fetchParams()
  whisperParams.fname_inp = file_name

  const streamAsync = util.promisify(whisper)

  const res = await streamAsync(whisperParams)

  return res
}

export { whisperTask }
