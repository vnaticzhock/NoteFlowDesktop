import { chatGeneration as chatGPTGeneration } from './chatgpt.js'
import { getDefaultApiKey } from './chatgpt_key.js'
import { chatGeneration as ollamaGeneration } from './ollama.js'
import {
  fetchMessages as fetchOllamaMessages,
  storeMessages as storeMessages,
} from './ollama_state.js'

const OPENAI_MODELS = ['GPT-3.5', 'GPT-4']

const chatGeneration = async (_, model, text, options = {}) => {
  if (OPENAI_MODELS.includes(model)) {
    // openai
    if (model == 'GPT-4') {
      return {
        role: 'Yoho',
        text: '太貴了先不要亂用! (可以到 controller/llms/generation.js 把這個 fake hub 關掉）',
        parentMessageId: 'fake-hub-1234',
      }
    }

    const key = getDefaultApiKey()
    const res = await chatGPTGeneration(text, model, key, options)

    storeMessages(
      [
        { role: 'user', text },
        { role: res.role, text: res.text },
      ],
      res.parentMessageId,
    )
    /**
     * Schema of chatGPT response:
     * obj {
     *    conversationId: undefined
     *    detail: 使用什麼模型，還有這個訊息在整個系統中的 uid
     *    usage: 產生的 tokens, 包含: completion_token & prompt_token(?)
     *    id: detail 中提到的 uid
     *    parentMessageId: 如果要繼續追問的話，便需要一起送這個字串出去
     *    role: "assistant"
     *    text: "..."
     * }
     */
    return res
  } else {
    // ollama

    // options handling
    let { parentMessageId } = options
    let messages = []
    if (parentMessageId) {
      // 去撈一些歷史紀錄出來
      messages = [
        ...fetchOllamaMessages(parentMessageId, 5).map((each) => {
          return {
            role: each.role,
            content: each.text,
          }
        }),
      ]
    } else {
      // Generate a parent message id
      parentMessageId = 'local-' + Date.now()
    }

    const userSay = { role: 'user', content: text }

    messages.push(userSay)
    const res = (await ollamaGeneration(model, messages)).message

    const chatbotSay = { role: res.role, text: res.content }
    storeMessages(
      [{ role: userSay.role, text: userSay.text }, chatbotSay],
      parentMessageId,
    )

    // 配合 chatGPT 回傳的 schema
    return {
      ...chatbotSay,
      parentMessageId,
    }
  }
}

export default chatGeneration
