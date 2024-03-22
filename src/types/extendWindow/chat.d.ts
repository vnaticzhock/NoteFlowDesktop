interface MessageContent {
  role: string
  content: string
}

interface MessageStream extends MessageContent {
  done: boolean
}

interface GenerationRequest {
  parentMessageId?: string
  content: string
  model: string
  callback: (data: MessageStream) => void
}

interface GenerationResponse {
  parentMessageId: string
  role: string
  content: string
}

export type {
  GenerationRequest,
  GenerationResponse,
  MessageContent,
  MessageStream
}
