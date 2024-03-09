import ollama from 'ollama'

// content: [{ role: 'user', content: 'why is the sky blue?' }]

const chatGeneration = async (_, model, content) => {
  const response = await ollama.chat({
    model: model,
    messages: content,
  })

  return response
}

const pullModel = async (_, model) => {
  ollama.pull()
}

export default chatGeneration
