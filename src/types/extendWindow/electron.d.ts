import {
  GenerationRequest,
  GenerationResponse,
  HistoryState,
  MessageContent,
  WhisperStream
} from './chat'
import { IFlow } from '../flow/flow'
import { IApiKeys } from '../llms/apiKeys'

interface ElectronAPI {
  fetchFlows: (offset: number) => Promise<IFlow[]>
  fetchFlow: (id: string) => Promise<any>
  createFlow: () => Promise<any>
  deleteFlow: (id: string) => Promise<any>
  saveFlowThumbnail: (flowId: string, base64: any) => Promise<any>
  editFlowTitle: (id: string, title: string) => Promise<any>
  createNode: () => Promise<any>
  editNodeTitle: (id: string, newTitle: string) => Promise<any>
  editNodeContent: (id: string, newContent: string) => Promise<any>
  deleteNode: (id: string) => Promise<any>
  fetchNode: (id: string) => Promise<any>
  addNodeToFavorite: (id: string) => Promise<any>
  removeNodeFromFavorite: (id: string) => Promise<any>
  fetchFavoriteNodes: () => Promise<any>
  fetchEdges: (flowId: string) => Promise<any>
  addEdge: (
    flowId: string,
    nodeIdSrc: string,
    nodeIdTgt: string,
    sourceHandle: string,
    targetHandle: string,
    style: string
  ) => Promise<any>
  removeEdge: (
    flowId: string,
    nodeIdSrc: string,
    nodeIdTgt: string,
    sourceHandle: string,
    targetHandle: string
  ) => Promise<any>
  addNodeToFlow: (
    flowId: string,
    nodeId: string,
    xpos: number,
    ypos: number,
    style: string
  ) => Promise<any>
  removeNodeFromFlow: (flowId: string, nodeId: string) => Promise<any>
  fetchNodesInFlow: (flowId: string) => Promise<any>
  editNodeInFlow: (flowId: string, nodeId: string, data: string) => Promise<any>
  uploadPhoto: (photoPath: string) => Promise<any>
  getPhoto: () => Promise<any>
  getLanguage: () => Promise<string>
  editLanguage: (language: string) => Promise<any>
  chatGeneration: (data: GenerationRequest) => Promise<GenerationResponse>
  getInstalledModelList: () => Promise<any>
  getModelList: () => Promise<any>
  pullModel: (model: string) => Promise<any>
  isPullingModel: () => Promise<boolean>
  getPullingProgress: () => Promise<any>
  getApiKeys: () => Promise<IApiKeys>
  getDefaultApiKey: () => Promise<string | undefined>
  addApiKey: (key: string) => Promise<any>
  updateDefaultApiKey: (key: string) => Promise<void>
  removeApiKey: (key: string) => Promise<void>
  removeProgressBar: () => Promise<void>
  setProgressBar: (progress: number) => Promise<any>
  isOllamaServicing: () => Promise<boolean>
  fetchHistories: () => Promise<HistoryState[]>
  insertNewHistory: (
    parentMessageId: string,
    name: string,
    model: string
  ) => Promise<number>
  updateHistory: (
    id: number,
    parentMessageId: string,
    name: string
  ) => Promise<void>
  fetchMessages: (id: number, limit: number) => Promise<MessageContent[]>
  whisperStartListening: (
    callback: (increment: WhisperStream) => void
  ) => Promise<void>
  whisperStopListening: () => Promise<void>
  listWhisperModels: () => Promise<Array<string>>
  listUserWhisperModels: () => Promise<{
    installed: Array<string>
    uninstalled: Array<string>
  }>
  downloadWhisperModel: (model: string) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export type { ElectronAPI }
