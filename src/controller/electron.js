import { ipcMain } from 'electron'

import {
  getPullingProgress,
  isPullingModel
} from './download/progressHandler.js'
import addNodeToFlow from './flows/addNodeToFlow.js'
import createFlow from './flows/createFlow.js'
import deleteFlow from './flows/deleteFlow.js'
import { addEdge, fetchEdges, removeEdge } from './flows/edges.js'
import editFlowTitle from './flows/editFlowTitle.js'
import editNodeInFlow from './flows/editNodeInFlow.js'
import { fetchFlow, fetchFlows } from './flows/fetchFlows.js'
import fetchNodesInFlow from './flows/fetchNodesInFlow.js'
import removeNodeFromFlow from './flows/removeNodeFromFlow.js'
import saveFlowThumbnail from './flows/saveFlowThumbNail.js'
import {
  removeProgressBar,
  setProgressBar
} from './functionality/progressBar.js'
import {
  fetchHistories,
  fetchMessages,
  insertNewHistory,
  updateHistory
} from './llms/chatState.js'
import {
  addApiKey,
  getApiKeys,
  getDefaultApiKey,
  removeApiKey,
  updateDefaultApiKey
} from './llms/chatgpt_key.js'
import { chatGeneration } from './llms/generation.js'
import {
  getInstalledModelList,
  getModelList,
  isOllamaServicing,
  pullModel
} from './llms/ollama.js'
import {
  fetchConfig,
  getDefaultConfig,
  updateConfig
} from './llms/parameters.js'
import createNode from './nodes/createNode.js'
import deleteNode from './nodes/deleteNode.js'
import { editNodeContent, editNodeTitle } from './nodes/editNode.js'
import {
  addNodeToFavorite,
  fetchFavoriteNodes,
  fetchIsFavorite,
  removeNodeFromFavorite
} from './nodes/favorites.js'
import fetchNode from './nodes/fetchNode.js'
import { editLanguage, getLanguage } from './personal/languages.js'
import { getPhoto, uploadPhoto } from './personal/uploadPhoto.js'
import {
  downloadModel,
  listAllModels,
  listUserWhisperModels
} from './whisper/download.js'
import {
  whisperStartListening,
  whisperStopListening
} from './whisper/stream.js'

/**
 * 在這邊的所有 API，可以當作是 router 的路由
 * 都會在後端進行渲染，跟 preload.js 是不一樣的！
 */

const registerBackendAPIs = () => {
  ipcMain.handle('flows:createFlow', createFlow)
  ipcMain.handle('flows:fetchFlows', fetchFlows)
  ipcMain.handle('flows:fetchFlow', fetchFlow)
  ipcMain.handle('flows:deleteFlow', deleteFlow)
  ipcMain.handle('flows:saveFlowThumbnail', saveFlowThumbnail)
  ipcMain.handle('flows:editFlowTitle', editFlowTitle)
  ipcMain.handle('nodes:createNode', createNode)
  ipcMain.handle('nodes:deleteNode', deleteNode)
  ipcMain.handle('nodes:editNodeTitle', editNodeTitle)
  ipcMain.handle('nodes:editNodeContent', editNodeContent)
  ipcMain.handle('nodes:fetchNode', fetchNode)
  ipcMain.handle('nodes:addNodeToFavorite', addNodeToFavorite)
  ipcMain.handle('nodes:removeNodeFromFavorite', removeNodeFromFavorite)
  ipcMain.handle('nodes:fetchFavoriteNodes', fetchFavoriteNodes)
  ipcMain.handle('nodes:fetchIsFavorite', fetchIsFavorite)
  ipcMain.handle('edges:fetchEdges', fetchEdges)
  ipcMain.handle('edges:addEdge', addEdge)
  ipcMain.handle('edges:removeEdge', removeEdge)
  ipcMain.handle('flows:addNodeToFlow', addNodeToFlow)
  ipcMain.handle('flows:removeNodeFromFlow', removeNodeFromFlow)
  ipcMain.handle('flows:fetchNodesInFlow', fetchNodesInFlow)
  ipcMain.handle('flows:editNodeInFlow', editNodeInFlow)
  ipcMain.handle('personal:uploadPhoto', uploadPhoto)
  ipcMain.handle('personal:getPhoto', getPhoto)
  ipcMain.handle('personal:getLanguage', getLanguage)
  ipcMain.handle('personal:editLanguage', editLanguage)
  ipcMain.handle('chat:isOllamaServicing', isOllamaServicing)
  ipcMain.handle('chat:chatGeneration', chatGeneration)
  ipcMain.handle('chat:getInstalledModelList', getInstalledModelList)
  ipcMain.handle('chat:getModelList', getModelList)
  ipcMain.handle('chat:pullModel', pullModel)
  ipcMain.handle('chat:isPullingModel', isPullingModel)
  ipcMain.handle('chat:getPullingProgress', getPullingProgress)
  ipcMain.handle('chat:getApiKeys', getApiKeys)
  ipcMain.handle('chat:getDefaultApiKey', getDefaultApiKey)
  ipcMain.handle('chat:addApiKey', addApiKey)
  ipcMain.handle('chat:updateDefaultApiKey', updateDefaultApiKey)
  ipcMain.handle('chat:removeApiKey', removeApiKey)
  ipcMain.handle('base:removeProgressBar', removeProgressBar)
  ipcMain.handle('base:setProgressBar', setProgressBar)
  ipcMain.handle('chat:fetchHistories', fetchHistories)
  ipcMain.handle('chat:updateHistory', updateHistory)
  ipcMain.handle('chat:insertNewHistory', insertNewHistory)
  ipcMain.handle('chat:fetchMessages', fetchMessages)
  ipcMain.handle('whisper:whisperStartListening', whisperStartListening)
  ipcMain.handle('whisper:whisperStopListening', whisperStopListening)
  ipcMain.handle('whisper:listAllModels', listAllModels)
  ipcMain.handle('whisper:listUserWhisperModels', listUserWhisperModels)
  ipcMain.handle('whisper:downloadModel', downloadModel)
  ipcMain.handle('model:getDefaultConfig', getDefaultConfig)
  ipcMain.handle('model:fetchConfig', fetchConfig)
  ipcMain.handle('model:updateConfig', updateConfig)
}

export default registerBackendAPIs
