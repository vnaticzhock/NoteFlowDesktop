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

const chatGeneration = async ({
  content,
  model,
  callback
}: GenerationRequest): Promise<GenerationResponse> => {
  const api = new ChatGPTAPI({
    apiKey: getDefaultApiKey(),
    completionParams: {
      model: MODEL_MAPPER[model],
      ...fetchModelConfig()
    }
  })

  const res = await api.sendMessage(content, {
    onProgress: (data: ChatMessage) => {
      callback({
        role: data.role,
        content: data.text,
        done: data.delta === undefined
      })
    }
  })

  return {
    parentMessageId: res.parentMessageId!,
    role: res.role,
    content: res.text
  }
}

const fetchModelConfig = () => {
  return {
    temperature: 0.5,
    top_p: 0.8
  }
}

export { chatGeneration }
