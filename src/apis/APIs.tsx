import {
  IModelConfig,
  IPullingModel,
  InstalledModel,
  ModelConfigMapping,
  UninstalledModel
} from '../types/llms/llm'
import { HistoryState } from '../components/FlowTool/ChatBot'
import {
  GenerationResponse,
  GenerationRequest,
  MessageContent,
  WhisperStream
} from '../types/extendWindow/chat'
import { IFlow } from '../types/flow/flow'
import { IApiKeys } from '../types/llms/apiKeys'

const fetchFlows = async (offset: number): Promise<IFlow[]> => {
  return await window.electronAPI.fetchFlows(offset)
}

const fetchFlow = async (id: string): Promise<IFlow> => {
  return await window.electronAPI.fetchFlow(id)
}

const createFlow = async (): Promise<void> => {
  return await window.electronAPI.createFlow()
}

const deleteFlow = async (id: string): Promise<void> => {
  return await window.electronAPI.deleteFlow(id)
}

const saveFlowThumbnail = async (
  flowId: string,
  base64: string
): Promise<void> => {
  return await window.electronAPI.saveFlowThumbnail(flowId, base64)
}

const editFlowTitle = async (id: string, title: string): Promise<void> => {
  return await window.electronAPI.editFlowTitle(id, title)
}

const createNode = async (): Promise<string> => {
  return await window.electronAPI.createNode()
}

const editNodeTitle = async (id: string, newTitle: string): Promise<void> => {
  return await window.electronAPI.editNodeTitle(id, newTitle)
}

const editNodeContent = async (
  id: string,
  newContent: string
): Promise<void> => {
  return await window.electronAPI.editNodeContent(id, newContent)
}

const deleteNode = async (id: string): Promise<void> => {
  return await window.electronAPI.deleteNode(id)
}

const fetchNode = async (id: string): Promise<any> => {
  return await window.electronAPI.fetchNode(id)
}

const addNodeToFavorite = async (id: string): Promise<void> => {
  return await window.electronAPI.addNodeToFavorite(id)
}

const removeNodeFromFavorite = async (id: string): Promise<void> => {
  return await window.electronAPI.removeNodeFromFavorite(id)
}

const fetchFavoriteNodes = async (): Promise<any> => {
  return await window.electronAPI.fetchFavoriteNodes()
}

const fetchEdges = async (flowId: string): Promise<any> => {
  return await window.electronAPI.fetchEdges(flowId)
}

const addEdgeInFlow = async (
  flowId: string,
  id: string,
  nodeIdSrc: string,
  nodeIdTgt: string,
  sourceHandle: string,
  targetHandle: string,
  style: string
): Promise<void> => {
  return await window.electronAPI.addEdge(
    flowId,
    id,
    nodeIdSrc,
    nodeIdTgt,
    sourceHandle,
    targetHandle,
    style
  )
}

const removeEdgeFromFlow = async (
  flowId: string,
  id: string
): Promise<void> => {
  return await window.electronAPI.removeEdge(flowId, id)
}

const addNodeToFlow = async (
  flowId: string,
  nodeId: string,
  xpos: number,
  ypos: number,
  style: string
): Promise<void> => {
  return await window.electronAPI.addNodeToFlow(
    flowId,
    nodeId,
    xpos,
    ypos,
    style
  )
}

const removeNodeFromFlow = async (
  flowId: string,
  nodeId: string
): Promise<void> => {
  return await window.electronAPI.removeNodeFromFlow(flowId, nodeId)
}

const fetchNodesInFlow = async (flowId: string): Promise<any> => {
  return await window.electronAPI.fetchNodesInFlow(flowId)
}

const updateNodeInFlow = async (
  flowId: string,
  nodeId: string,
  data: string
): Promise<void> => {
  return await window.electronAPI.editNodeInFlow(flowId, nodeId, data)
}

const uploadPhoto = async (photoPath: string): Promise<void> => {
  return await window.electronAPI.uploadPhoto(photoPath)
}

const getPhoto = async (): Promise<any> => {
  return await window.electronAPI.getPhoto()
}

const getLanguage = async (): Promise<string> => {
  return await window.electronAPI.getLanguage()
}

const editLanguage = async (language: string): Promise<void> => {
  return await window.electronAPI.editLanguage(language)
}

const chatGeneration = async (
  data: GenerationRequest
): Promise<GenerationResponse> => {
  const res = await window.electronAPI.chatGeneration(data)

  return res
}

const isOllamaServicing = async (): Promise<boolean> => {
  return await window.electronAPI.isOllamaServicing()
}

const getInstalledModelList = async (): Promise<any> => {
  return await window.electronAPI.getInstalledModelList()
}

const getModelList = async (): Promise<{
  installed: InstalledModel[]
  uninstalled: UninstalledModel[]
}> => {
  return await window.electronAPI.getModelList()
}

const pullModel = async (model: string): Promise<void> => {
  return await window.electronAPI.pullModel(model)
}

const isPullingModel = async (): Promise<boolean> => {
  return await window.electronAPI.isPullingModel()
}

const getPullingProgress = async (): Promise<IPullingModel[]> => {
  return await window.electronAPI.getPullingProgress()
}

const getApiKeys = async (): Promise<IApiKeys> => {
  return await window.electronAPI.getApiKeys()
}

const getChatGPTDefaultApiKey = async (): Promise<string | undefined> => {
  return await window.electronAPI.getDefaultApiKey()
}

const addChatGPTApiKey = async (key: string): Promise<void> => {
  return await window.electronAPI.addApiKey(key)
}

const updateChatGPTDefaultApiKey = async (key: string): Promise<void> => {
  return await window.electronAPI.updateDefaultApiKey(key)
}

const removeChatGPTApiKey = async (key: string): Promise<void> => {
  return await window.electronAPI.removeApiKey(key)
}

const removeProgressBar = async (): Promise<void> => {
  return await window.electronAPI.removeProgressBar()
}

const setProgressBar = async (progress: number): Promise<void> => {
  return await window.electronAPI.setProgressBar(progress)
}

const fetchHistories = async (): Promise<HistoryState[]> => {
  return await window.electronAPI.fetchHistories()
}

const insertNewHistory = async (
  parentMessageId: string,
  name: string,
  model: string
): Promise<number> => {
  return await window.electronAPI.insertNewHistory(parentMessageId, name, model)
}

const updateHistory = async (
  id: number,
  parentMessageId: string,
  name: string
): Promise<void> => {
  return await window.electronAPI.updateHistory(id, parentMessageId, name)
}

const fetchMessages = async (
  messageId: number,
  limit: number
): Promise<MessageContent[]> => {
  return await window.electronAPI.fetchMessages(messageId, limit)
}

let whisper_working = false

const whisperStartListening = async (
  callback: (increment: WhisperStream) => void
): Promise<Error | void> => {
  if (!callback) {
    return Error('callback is being used in this context')
  }
  if (whisper_working) {
    return Error('whisper is working right now. close it first.')
  }
  whisper_working = true
  return await window.electronAPI.whisperStartListening(callback)
}

const whisperStopListening = async (): Promise<Error | void> => {
  if (!whisper_working) {
    console.log('error')
    return Error('what are you doing? whisper is not working right now.')
  }
  await window.electronAPI.whisperStopListening()
  whisper_working = false
}

const listWhisperModels = async () => {
  return await window.electronAPI.listWhisperModels()
}

const listUserWhisperModels = async () => {
  return await window.electronAPI.listUserWhisperModels()
}

const downloadWhisperModel = async (model: string) => {
  return await window.electronAPI.downloadWhisperModel(model)
}

const getDefaultConfig = async (model: string) => {
  return await window.electronAPI.getDefaultConfig(model)
}

const fetchConfig = async <K extends keyof ModelConfigMapping>(
  model: K
): Promise<ModelConfigMapping[K]> => {
  return await window.electronAPI.fetchConfig(model)
}

const updateConfig = async (model: string, config: IModelConfig) => {
  return await window.electronAPI.updateConfig(model, config)
}

const DEFAULT_MODELS = ['GPT-3.5', 'GPT-4']

export {
  DEFAULT_MODELS,
  addChatGPTApiKey,
  getDefaultConfig,
  fetchConfig,
  updateConfig,
  listWhisperModels,
  listUserWhisperModels,
  downloadWhisperModel,
  addEdgeInFlow,
  addNodeToFavorite,
  addNodeToFlow,
  chatGeneration,
  createFlow,
  createNode,
  deleteFlow,
  deleteNode,
  editFlowTitle,
  editLanguage,
  editNodeContent,
  editNodeTitle,
  fetchEdges,
  fetchFavoriteNodes,
  fetchFlow,
  fetchFlows,
  fetchNode,
  fetchNodesInFlow,
  getApiKeys,
  getChatGPTDefaultApiKey,
  getInstalledModelList,
  getLanguage,
  getModelList,
  getPhoto,
  getPullingProgress,
  isOllamaServicing,
  isPullingModel,
  pullModel,
  removeChatGPTApiKey,
  removeEdgeFromFlow,
  removeNodeFromFavorite,
  removeNodeFromFlow,
  removeProgressBar,
  saveFlowThumbnail,
  setProgressBar,
  updateChatGPTDefaultApiKey,
  updateNodeInFlow,
  uploadPhoto,
  fetchHistories,
  insertNewHistory,
  updateHistory,
  fetchMessages,
  whisperStartListening,
  whisperStopListening
}
