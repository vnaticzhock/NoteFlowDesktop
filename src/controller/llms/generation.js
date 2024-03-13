import { chatGeneration as chatGPTGeneration } from './chatgpt.js'
import { getDefaultApiKey } from './chatgpt_key.js'
import { chatGeneration as ollamaGeneration } from './ollama.js'

const OPENAI_MODELS = ['GPT-3.5', 'GPT-4']

const chatGeneration = async (_, model, content) => {
  if (OPENAI_MODELS.includes(model)) {
    // openai
    const key = getDefaultApiKey()
    const res = await chatGPTGeneration(content, key)

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

    // 因為 chatGPT 使用 conversationId 進行狀態管理
    // 所以我開始認為應該也要在後端進行狀態管理
    // 否則前後端互傳，會 clone 非常多東西出來。
    // 先放進 TODO 裡
    const res = (
      await ollamaGeneration(model, [{ role: 'user', content: content }])
    ).message

    return {
      role: res.role,
      text: res.content,
    }
  }
}

export default chatGeneration
