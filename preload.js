/* eslint-disable no-undef */
import { contextBridge, ipcRenderer } from 'electron/renderer'

/**
 * 這個檔案所做的事情與 electron.js 不同
 * 並且在這裡做的所有動作會在前端被渲染！
 */

contextBridge.exposeInMainWorld('electronAPI', {
  fetchFlows: page => ipcRenderer.invoke('flows:fetchFlows', page),
  fetchFlow: id => ipcRenderer.invoke('flows:fetchFlow', IDBIndex),
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
  addEdge: (flowId, nodeIdSrc, nodeIdTgt, sourceHandle, targetHandle, style) =>
    ipcRenderer.invoke(
      'edges:addEdge',
      flowId,
      nodeIdSrc,
      nodeIdTgt,
      sourceHandle,
      targetHandle,
      style
    ),
  removeEdge: (flowId, nodeIdSrc, nodeIdTgt, sourceHandle, targetHandle) =>
    ipcRenderer.invoke(
      'edges:removeEdge',
      flowId,
      nodeIdSrc,
      nodeIdTgt,
      sourceHandle,
      targetHandle
    ),
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
  chatGeneration: async (model, content, setState) => {
    // 瘋狂接收資料了
    ipcRenderer.addListener(`chatbot-response`, (event, data) => {
      if (data.done) {
        ipcRenderer.removeListener(`chatbot-response`, () => {})
      } else {
        // setState((prev) => prev + data.value)
        setState(data)
      }
    })
    const res = ipcRenderer.invoke('chat:chatGeneration', model, content)

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
    ipcRenderer.invoke('base:setProgressBar', progress)
})
