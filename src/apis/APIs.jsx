const fetchFlows = async (page) => {
  return await window.electronAPI.fetchFlows(page)
}

const fetchFlow = async (id) => {
  return await window.electronAPI.fetchFlows(id)
}

const createFlow = async () => {
  return await window.electronAPI.createFlow()
}

const deleteFlow = async (id) => {
  return await window.electronAPI.deleteFlow(id)
}

const saveFlowThumbnail = async (flowId, base64) => {
  return await window.electronAPI.saveFlowThumbnail(flowId, base64)
}

const editFlowTitle = async (id, title) => {
  return await window.electronAPI.editFlowTitle(id, title)
}

const createNode = async () => {
  return await window.electronAPI.createNode()
}

const editNodeTitle = async (id, newTitle) => {
  return await window.electronAPI.editNodeTitle(id, newTitle)
}

const editNodeContent = async (id, newContent) => {
  return await window.electronAPI.editNodeContent(id, newContent)
}

const deleteNode = async (id) => {
  return await window.electronAPI.deleteNode(id)
}

const fetchNode = async (id) => {
  return await window.electronAPI.fetchNode(id)
}

const addNodeToFavorite = async (id) => {
  return await window.electronAPI.addNodeToFavorite(id)
}

const removeNodeFromFavorite = async (id) => {
  return await window.electronAPI.removeNodeFromFavorite(id)
}

const fetchFavoriteNodes = async () => {
  return await window.electronAPI.fetchFavoriteNodes()
}

const fetchEdges = async (flowId) => {
  return await window.electronAPI.fetchEdges(flowId)
}

const addEdgeInFlow = async (
  flowId,
  nodeIdSrc,
  nodeIdTgt,
  sourceHandle,
  targetHandle,
  style,
) => {
  return await window.electronAPI.addEdge(
    flowId,
    nodeIdSrc,
    nodeIdTgt,
    sourceHandle,
    targetHandle,
    style,
  )
}

const removeEdgeFromFlow = async (
  flowId,
  nodeIdSrc,
  nodeIdTgt,
  sourceHandle,
  targetHandle,
) => {
  return await window.electronAPI.removeEdge(
    flowId,
    nodeIdSrc,
    nodeIdTgt,
    sourceHandle,
    targetHandle,
  )
}

const addNodeToFlow = async (flowId, nodeId, xpos, ypos, style) => {
  return await window.electronAPI.addNodeToFlow(
    flowId,
    nodeId,
    xpos,
    ypos,
    style,
  )
}

const removeNodeFromFlow = async (flowId, nodeId) => {
  return await window.electronAPI.removeNodeFromFlow(flowId, nodeId)
}

const fetchNodesInFlow = async (flowId) => {
  return await window.electronAPI.fetchNodesInFlow(flowId)
}

const updateNodeInFlow = async (flowId, nodeId, data) => {
  return await window.electronAPI.editNodeInFlow(flowId, nodeId, data)
}

const uploadPhoto = async (photo) => {
  return await window.electronAPI.uploadPhoto(photo)
}

const getPhoto = async () => {
  return await window.electronAPI.getPhoto()
}

const getLanguage = async () => {
  return await window.electronAPI.getLanguage()
}

const editLanguage = async (lang) => {
  return await window.electronAPI.editLanguage(lang)
}

const chatGeneration = async (model, content) => {
  return await window.electronAPI.chatGeneration(model, content)
}

const isOllamaServicing = async () => {
  return await window.electronAPI.isOllamaServicing()
}

const getInstalledModelList = async () => {
  return await window.electronAPI.getInstalledModelList()
}

const getModelList = async () => {
  return await window.electronAPI.getModelList()
}

const pullModel = async (model) => {
  return await window.electronAPI.pullModel(model)
}

const isPullingModel = async () => {
  return await window.electronAPI.isPullingModel()
}

const getPullingProgress = async () => {
  return await window.electronAPI.getPullingProgress()
}

const getApiKeys = async () => {
  return await window.electronAPI.getApiKeys()
}

const getChatGPTDefaultApiKey = async () => {
  return await window.electronAPI.getDefaultApiKey()
}

const addChatGPTApiKey = async (key) => {
  return await window.electronAPI.addApiKey(key)
}

const updateChatGPTDefaultApiKey = async (key) => {
  return await window.electronAPI.updateDefaultApiKey(key)
}

const removeChatGPTApiKey = async (key) => {
  return await window.electronAPI.removeApiKey(key)
}

const removeProgressBar = async () => {
  return await window.electronAPI.removeProgressBar()
}

const setProgressBar = async (progress) => {
  return await window.electronAPI.setProgressBar(progress)
}

const DEFAULT_MODELS = ['GPT-3.5', 'GPT-4']

export {
  DEFAULT_MODELS,
  addChatGPTApiKey,
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
}
