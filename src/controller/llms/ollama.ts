import ollama, { ChatResponse, Message } from 'ollama'
import { addToPulling } from '../download/progressHandler.js'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import type {
  InstalledModel,
  UninstalledModel,
  IOllamaModel
} from '../../types/llms/llm.js'

const __fileName = fileURLToPath(import.meta.url)
const __dirName = path.dirname(__fileName)

const chatGeneration = async (
  model: string,
  content: Message[]
): Promise<AsyncGenerator<ChatResponse, any, unknown>> => {
  const resGenerator = await ollama.chat({
    model: model,
    messages: content,
    stream: true
  })

  return resGenerator
}

const isOllamaServicing = async (): Promise<boolean> => {
  try {
    await ollama.list()
    return true
  } catch (error) {
    return false
  }
}

const getInstalledModelList = async (): Promise<Array<InstalledModel>> => {
  const model_list = await ollama.list()
  return model_list.models.map(each => {
    const { name, modified_at, digest, parameter_size, quantization_level } =
      each

    const model_name = name.split(':')[0]
    const version = name.split(':')[1]

    return {
      id: name,
      name: model_name,
      version,
      modified_at,
      parameter_size,
      quantization_level,
      digest
    }
  })
}

const getModelList = async () => {
  const installedList = await getInstalledModelList()

  const installed: InstalledModel[] = []
  const uninstalled: UninstalledModel[] = []

  MODELS_LIST.forEach(each => {
    for (let i = 0; i < installedList.length; i++) {
      if (installedList[i].name === each.name) {
        installed.push({
          ...installedList[i],
          ...each
        })
        return
      }
    }

    uninstalled.push(each)
  })

  return {
    installed,
    uninstalled
  }
}

const pullModel = async (_, model: string): Promise<void> => {
  addToPulling({
    name: model,
    generator: await ollama.pull({ model, stream: true }),
    total: 0,
    completed: -1
  })
}

const MODELS_LIST: Array<IOllamaModel> = JSON.parse(
  fs.readFileSync(path.join(__dirName, 'ollama_models.json'), 'utf-8')
)

export {
  chatGeneration,
  getInstalledModelList,
  getModelList,
  isOllamaServicing,
  pullModel
}
