import { ipcMain } from 'electron'
import { fetchFlows, fetchFlow } from './flows/fetchFlows.js'
import deleteFlow from './flows/deleteFlow.js'
import createFlow from './flows/createFlow.js'
import createNode from './nodes/createNode.js'
import saveFlowThumbnail from './flows/saveFlowThumbNail.js'
import { editNodeTitle, editNodeContent } from './nodes/editNode.js'
import deleteNode from './nodes/deleteNode.js'
import fetchNode from './nodes/fetchNode.js'
import addNodeToFlow from './flows/addNodeToFlow.js'
import removeNodeFromFlow from './flows/removeNodeFromFlow.js'
import fetchNodesInFlow from './flows/fetchNodesInFlow.js'
import editFlowTitle from './flows/editFlowTitle.js'
import editNodeInFlow from './flows/editNodeInFlow.js'
import { uploadPhoto, getPhoto } from './personal/uploadPhoto.js'
import { getLanguage, editLanguage } from './personal/languages.js'
import chatGeneration from './llms/ollama.js'
import {
  addNodeToFavorite,
  removeNodeFromFavorite,
  fetchFavoriteNodes,
} from './nodes/favorites.js'
import { fetchEdges, addEdge, removeEdge } from './flows/edges.js'

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
  ipcMain.handle('chat:chatGeneration', chatGeneration)
}

export default registerBackendAPIs
