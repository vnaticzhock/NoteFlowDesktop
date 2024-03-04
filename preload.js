/* eslint-disable no-undef */
const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  fetchFlows: (page) => ipcRenderer.invoke('flows:fetchFlows', page),
  fetchFlow: (id) => ipcRenderer.invoke('flows:fetchFlow', IDBIndex),
  deleteFlow: (id) => ipcRenderer.invoke('flows:deleteFlow', id),
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
  deleteNode: (id) => ipcRenderer.invoke('nodes:deleteNode', id),
  fetchNode: (id) => ipcRenderer.invoke('nodes:fetchNode', id),
  addNodeToFavorite: (id) => ipcRenderer.invoke('nodes:addNodeToFavorite', id),
  removeNodeFromFavorite: (id) =>
    ipcRenderer.invoke('nodes:removeNodeFromFavorite', id),
  fetchFavoriteNodes: () => ipcRenderer.invoke('nodes:fetchFavoriteNodes'),
  addNodeToFlow: (flowId, nodeId, xpos, ypos, style) =>
    ipcRenderer.invoke(
      'flows:addNodeToFlow',
      flowId,
      nodeId,
      xpos,
      ypos,
      style,
    ),
  removeNodeFromFlow: (flowId, nodeId) =>
    ipcRenderer.invoke('flows:removeNodeFromFlow', flowId, nodeId),
  fetchNodesInFlow: (flowId) =>
    ipcRenderer.invoke('flows:fetchNodesInFlow', flowId),
  editNodeInFlow: (flowId, nodeId, data) =>
    ipcRenderer.invoke('flows:editNodeInFlow', flowId, nodeId, data),
  uploadPhoto: (photo) => ipcRenderer.invoke('personal:uploadPhoto', photo),
  getPhoto: () => ipcRenderer.invoke('personal:getPhoto'),
  getLanguage: () => ipcRenderer.invoke('personal:getLanguage'),
  editLanguage: (lang) => ipcRenderer.invoke('personal:editLanguage', lang),
  chatGeneration: (model, content) =>
    ipcRenderer.invoke('chat:chatGeneration', model, content),
})
