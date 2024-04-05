type IWhisperParams = {
  language: string
  model: string
  use_gpu: boolean
  length_ms: number
  step_ms: number
  keep_ms: number
  max_tokens: number
  vad_threshold: number
  no_timestamps: boolean
}

export type { IWhisperParams }
