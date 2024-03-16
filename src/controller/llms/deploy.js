import { LlamaChatSession, LlamaContext, LlamaModel } from 'node-llama-cpp'
import path from 'path'
import { fileURLToPath } from 'url'

class LlamaModelInterface {
  constructor() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))

    this.model = new LlamaModel({
      modelPath: path.join(__dirname, 'models', 'codellama-13b.Q3_K_M.gguf')
    })
    this.newSession()
  }

  newSession() {
    const context = new LlamaContext({ model: this.model })
    this.session = new LlamaChatSession({ context })
    this.sessionCreated = true
  }
}

const models = {}

export default models
