interface IInstalledOllamaModel {
  version: string
  modified_at: Date
  parameter_size: string
  quantization_level: string
  digest: string
}

type IOllamaModel = {
  id: string
  name: string
  description?: string
}

type InstalledModel = IInstalledOllamaModel & IOllamaModel
type UninstalledModel = IOllamaModel

type IPullingModel = {
  name: string
  total: number
  completed: number
}

type IChatGPTConfigs = {
  frequency_penalty: 0
  max_tokens: -1
  temperature: 1
  top_p: 1
}

type IOllamaConfigs = {
  num_ctx: 4096
  temperature: 0.7
  tfs_z: 1
  top_k: 40
  top_p: 0.9
}

type IWhisperConfigs = {
  no_timestamps: true
  length_ms: 10000
  step_ms: 3000
  keep_ms: 200
  max_tokens_in_stream: 32
  use_vad: true
  vad_threshold: 0.6
}

type IModelConfig = IChatGPTConfigs | IOllamaConfigs | IWhisperConfigs

export type {
  IInstalledOllamaModel,
  IOllamaConfigs,
  IChatGPTConfigs,
  IWhisperConfigs,
  IModelConfig,
  IOllamaModel,
  InstalledModel,
  UninstalledModel,
  IPullingModel
}
