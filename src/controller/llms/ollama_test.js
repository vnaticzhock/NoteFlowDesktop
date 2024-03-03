import ollama from 'ollama'

console.log('hi')

const response = await ollama.chat({
  model: 'llama2',
  messages: [{ role: 'user', content: 'why is the sky blue?' }],
})

console.log(response.message.content)
