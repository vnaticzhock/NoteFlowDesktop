// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require('electron')

import { ElectronAPI } from './src/types/extendWindow/electron'
import { MessageStream, WhisperStream } from './src/types/extendWindow/chat'
import { IModelConfig } from './src/types/llms/llm'

/**
 * 這個檔案所做的事情與 electron.js 不同
 * 並且在這裡做的所有動作會在前端被渲染！
 */

const APIs: ElectronAPI = {
  fetchFlows: page => ipcRenderer.invoke('flows:fetchFlows', page),
  fetchFlow: () => ipcRenderer.invoke('flows:fetchFlow'),
  deleteFlow: id => ipcRenderer.invoke('flows:deleteFlow', id),
  createFlow: () => ipcRenderer.invoke('flows:createFlow'),
  saveFlowThumbnail: (flowId, base64) =>
    ipcRenderer.invoke('flows:saveFlowThumbnail', flowId, base64),
  editFlowTitle: (id, newTitle) =>
    ipcRenderer.invoke('flows:editFlowTitle', id, newTitle),
  createNode: () => ipcRenderer.invoke('nodes:createNode'),
  editNodeTitle: (id, newTitle) =>
    ipcRenderer.invoke('nodes:editNodeTitle', id, newTitle),
  editNodeContent: (id, newContent) =>
    ipcRenderer.invoke('nodes:editNodeContent', id, newContent),
  deleteNode: id => ipcRenderer.invoke('nodes:deleteNode', id),
  fetchNode: id => ipcRenderer.invoke('nodes:fetchNode', id),
  addNodeToFavorite: id => ipcRenderer.invoke('nodes:addNodeToFavorite', id),
  removeNodeFromFavorite: id =>
    ipcRenderer.invoke('nodes:removeNodeFromFavorite', id),
  fetchFavoriteNodes: () => ipcRenderer.invoke('nodes:fetchFavoriteNodes'),
  fetchEdges: flowId => ipcRenderer.invoke('edges:fetchEdges', flowId),
  addEdge: (
    flowId,
    id,
    nodeIdSrc,
    nodeIdTgt,
    sourceHandle,
    targetHandle,
    style
  ) =>
    ipcRenderer.invoke(
      'edges:addEdge',
      flowId,
      id,
      nodeIdSrc,
      nodeIdTgt,
      sourceHandle,
      targetHandle,
      style
    ),
  removeEdge: (flowId, id) =>
    ipcRenderer.invoke('edges:removeEdge', flowId, id),
  addNodeToFlow: (flowId, nodeId, xpos, ypos, style) =>
    ipcRenderer.invoke(
      'flows:addNodeToFlow',
      flowId,
      nodeId,
      xpos,
      ypos,
      style
    ),
  removeNodeFromFlow: (flowId, nodeId) =>
    ipcRenderer.invoke('flows:removeNodeFromFlow', flowId, nodeId),
  fetchNodesInFlow: flowId =>
    ipcRenderer.invoke('flows:fetchNodesInFlow', flowId),
  editNodeInFlow: (flowId, nodeId, data) =>
    ipcRenderer.invoke('flows:editNodeInFlow', flowId, nodeId, data),
  uploadPhoto: photo => ipcRenderer.invoke('personal:uploadPhoto', photo),
  getPhoto: () => ipcRenderer.invoke('personal:getPhoto'),
  getLanguage: () => ipcRenderer.invoke('personal:getLanguage'),
  editLanguage: lang => ipcRenderer.invoke('personal:editLanguage', lang),
  chatGeneration: async data => {
    // 瘋狂接收資料了
    const { callback } = data

    ipcRenderer.addListener(
      `chatbot-response`,
      (event, data: MessageStream) => {
        if (data.done) {
          ipcRenderer.removeListener(`chatbot-response`, () => {})
        } else {
          // function 沒有辦法勾進來 -> 使用 async generator?
          callback(data)
        }
      }
    )

    const { content, model, parentMessageId, id } = data
    const res = await ipcRenderer.invoke('chat:chatGeneration', {
      content,
      model,
      parentMessageId,
      id
    })

    return res
  },
  isOllamaServicing: () => ipcRenderer.invoke('chat:isOllamaServicing'),
  getInstalledModelList: () => ipcRenderer.invoke('chat:getInstalledModelList'),
  getModelList: () => ipcRenderer.invoke('chat:getModelList'),
  pullModel: model => ipcRenderer.invoke('chat:pullModel', model),
  isPullingModel: () => ipcRenderer.invoke('chat:isPullingModel'),
  getPullingProgress: () => ipcRenderer.invoke('chat:getPullingProgress'),
  getApiKeys: () => ipcRenderer.invoke('chat:getApiKeys'),
  getDefaultApiKey: () => ipcRenderer.invoke('chat:getDefaultApiKey'),
  addApiKey: key => ipcRenderer.invoke('chat:addApiKey', key),
  updateDefaultApiKey: key =>
    ipcRenderer.invoke('chat:updateDefaultApiKey', key),
  removeApiKey: key => ipcRenderer.invoke('chat:removeApiKey', key),
  removeProgressBar: () => ipcRenderer.invoke('base:removeProgressBar'),
  setProgressBar: progress =>
    ipcRenderer.invoke('base:setProgressBar', progress),
  fetchHistories: () => ipcRenderer.invoke('chat:fetchHistories'),
  insertNewHistory: (messageId: string, name: string, model: string) =>
    ipcRenderer.invoke('chat:insertNewHistory', messageId, name, model),
  updateHistory: (id: number, parentMessageId: string, name: string) =>
    ipcRenderer.invoke('chat:updateHistory', id, parentMessageId, name),
  fetchMessages: (id: number, limit: number) =>
    ipcRenderer.invoke('chat:fetchMessages', id, limit),
  whisperStartListening: async (
    callback: (increment: WhisperStream) => void
  ): Promise<void> => {
    if (!callback) {
      console.log('error: no callback for whisper')
      return
    }
    ipcRenderer.addListener(
      `whisper-response`,
      (event, data: WhisperStream) => {
        if (data.done) {
          ipcRenderer.removeListener(`whisper-response`, () => {})
        } else {
          // function 沒有辦法勾進來 -> 使用 async generator?
          callback(data)
        }
      }
    )

    await ipcRenderer.invoke('whisper:whisperStartListening')
  },
  whisperStopListening: () =>
    ipcRenderer.invoke('whisper:whisperStopListening'),
  listWhisperModels: () => ipcRenderer.invoke('whisper:listAllModels'),
  listUserWhisperModels: () =>
    ipcRenderer.invoke('whisper:listUserWhisperModels'),
  downloadWhisperModel: (model: string) =>
    ipcRenderer.invoke('whisper:downloadModel', model),
  getDefaultConfig: (model: string) =>
    ipcRenderer.invoke('model:getDefaultConfig', model),
  fetchConfig: (model: string) =>
    ipcRenderer.invoke('model:fetchConfig', model),
  updateConfig: (model: string, config: IModelConfig) =>
    ipcRenderer.invoke('model:updateConfig', model, config)
}

contextBridge.exposeInMainWorld('electronAPI', APIs)
