import type { MessageStream } from '../extendWindow/chat.d.ts'

type IWhisperParams = {
  language: string
  model: string
  use_gpu: boolean
  callback?: (data: MessageStream) => void
  // onProgress: (increment: string) => void
}

export type { IWhisperParams }
