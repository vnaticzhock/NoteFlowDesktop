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
  id: number
  callback: (data: MessageStream) => void
}

interface GenerationResponse {
  id: number
  parentMessageId: string
  role: string
  content: string
}

type HistoryState = {
  id: number
  parentMessageId: string
  name: string
  model: string
}

type NewMessageState = {
  id: number
  parentMessageId: string
  name: string
  model: string
}

export type {
  GenerationRequest,
  GenerationResponse,
  MessageContent,
  MessageStream,
  HistoryState,
  NewMessageState
}
