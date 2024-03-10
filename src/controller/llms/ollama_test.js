// import { Stream } from '@mui/icons-material'
import ollama from 'ollama'

// export interface ProgressResponse {
//   status: string
//   digest: string
//   total: number
//   completed: number
// }

// setInterval(async () => {
//   console.log(await response.next())
// }, 1000)

const generator = await ollama.pull({ model: 'mistral', stream: true })

let result = await generator.next()
while (result) {
  console.log(result)
  result = await generator.next()
}
console.log('next')
