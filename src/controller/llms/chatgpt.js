import { ChatGPTAPI } from 'chatgpt'

const chatGeneration = async (content, key) => {
  const api = new ChatGPTAPI({
    apiKey: key,
  })

  const res = await api.sendMessage(content)

  return res
}

export { chatGeneration }
