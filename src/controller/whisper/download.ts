import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { addToPulling, filterProgress } from '../download/progressHandler.js'
import { fileURLToPath } from 'url'
import { fetchConfig, updateConfig } from '../llms/parameters.js'
import { IWhisperConfigs } from '../../types/llms/llm.js'

const __fileName = fileURLToPath(import.meta.url)
const __dirName = path.dirname(__fileName)

const whisperCppFolder = path.join(__dirName, '../../../whisper.cpp')

const valid_models = [
  'tiny',
  'tiny.en',
  'tiny-q5_1',
  'tiny.en-q5_1',
  'base',
  'base.en',
  'base-q5_1',
  'base.en-q5_1',
  'small',
  'small.en',
  'small.en-tdrz',
  'small-q5_1',
  'small.en-q5_1',
  'medium',
  'medium.en',
  'medium-q5_0',
  'medium.en-q5_0',
  'large-v1',
  'large-v2',
  'large-v2-q5_0',
  'large-v3',
  'large-v3-q5_0'
]

// use typescript for examination
const isValidModels = (path: string): boolean => {
  return valid_models.includes(path)
}

const isInstalledModels = (model: string): boolean => {
  const file_name = `ggml-${model}.bin`
  const file_path = path.join(whisperCppFolder, 'models', file_name)

  return fs.existsSync(file_path)
}

const listUserWhisperModels = (): {
  installed: Array<string>
  uninstalled: Array<string>
} => {
  const uninstalled: string[] = []
  const installed = valid_models.filter(each => {
    const is = isInstalledModels(each)
    if (!is) {
      uninstalled.push(each)
    }
    return is
  })

  return {
    installed,
    uninstalled
  }
}

const listAllModels = (): Array<string> => {
  return valid_models
}

const downloadModel = async (_, model: string): Promise<boolean> => {
  if (!isValidModels(model)) {
    return false
  }
  if (isInstalledModels(model)) {
    return false
  }

  // setup: check if this is the first model
  const changeDefaultModel = listUserWhisperModels().installed.length === 0

  const command = `bash ${whisperCppFolder}/models/download-ggml-model.sh ${model}`

  console.log(`Downloading whisper model with command: "${command}"`)

  const downloading = {
    name: model,
    total: 100,
    completed: 0
  }

  addToPulling(downloading)

  const child = exec(command)

  child.stdout?.on('data', data => {
    console.log(data)
  })

  let lastPercentage = ''

  child.stderr?.on('data', data => {
    const progressRegex = /[\d]+\%/
    const result = data.match(progressRegex)
    if (!result) return

    const percentage: string = result[0]
    if (percentage != lastPercentage) {
      lastPercentage = percentage
      downloading.completed = parseInt(percentage.slice(0, -1))
    }
  })

  child.on('close', code => {
    downloading.completed = 100
    filterProgress(downloading.name)

    if (changeDefaultModel) {
      const configs: IWhisperConfigs = fetchConfig(_, 'whisper')
      console.log(configs)
      configs.default_model = model
      updateConfig(_, 'whisper', configs)
    }
  })

  return true
}

export { listAllModels, listUserWhisperModels, downloadModel }
