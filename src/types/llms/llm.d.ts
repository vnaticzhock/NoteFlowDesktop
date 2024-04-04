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

export type {
  IInstalledOllamaModel,
  IOllamaModel,
  InstalledModel,
  UninstalledModel,
  IPullingModel
}
