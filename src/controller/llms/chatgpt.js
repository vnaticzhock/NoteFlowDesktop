import { ChatGPTAPI } from 'chatgpt'

const MODEL_MAPPER = {
  'GPT-3.5': 'gpt-3.5-turbo',
  'GPT-4': 'gpt-4'
}

const chatGeneration = async (content, model, key, options) => {
  const api = new ChatGPTAPI({
    apiKey: key,
    completionParams: {
      model: MODEL_MAPPER[model],
      ...fetchModelConfig()
    }
  })

  const res = await api.sendMessage(content, {
    ...options
  })

  return res
}

const fetchModelConfig = () => {
  return {
    temperature: 0.5,
    top_p: 0.8
  }
}

export { chatGeneration }
