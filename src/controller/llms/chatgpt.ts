import { ChatGPTAPI, ChatMessage } from 'chatgpt'

import { getDefaultApiKey } from './chatgpt_key.js'
import {
  GenerationRequest,
  GenerationResponse
} from '../../types/extendWindow/chat.js'

const MODEL_MAPPER = {
  'GPT-3.5': 'gpt-3.5-turbo',
  'GPT-4': 'gpt-4'
}

interface Dict<T> {
  [key: string]: T
}

const api: Dict<ChatGPTAPI> = {}

const chatGeneration = async ({
  id,
  content,
  model,
  parentMessageId,
  callback
}: GenerationRequest): Promise<GenerationResponse> => {
  if (!(model in api)) {
    api[model] = new ChatGPTAPI({
      apiKey: getDefaultApiKey(),
      completionParams: {
        model: MODEL_MAPPER[model],
        ...fetchModelConfig()
      }
    })
  }

  let gpt = api[model]

  const key = getDefaultApiKey()
  if (gpt.apiKey !== key) {
    api[model] = new ChatGPTAPI({
      apiKey: getDefaultApiKey(),
      completionParams: {
        model: MODEL_MAPPER[model],
        ...fetchModelConfig()
      }
    })
    gpt = api[model]
  }

  const res = await gpt.sendMessage(content, {
    parentMessageId: parentMessageId,
    onProgress: (data: ChatMessage) => {
      callback({
        role: data.role,
        content: data.text,
        done: data.delta === undefined
      })
    }
  })

  return {
    parentMessageId: res.id,
    role: res.role,
    content: res.text,
    id
  }
}

const fetchModelConfig = () => {
  return {
    temperature: 0.5,
    top_p: 0.8
  }
}

export { chatGeneration }
