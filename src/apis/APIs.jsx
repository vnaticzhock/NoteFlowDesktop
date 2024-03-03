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

const addNodeToFlow = async (flowId, nodeId, xpos, ypos, style) => {
  console.log(flowId, nodeId, xpos, ypos, style)
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

const getLanguage = async () => {
  return await window.electronAPI.getLanguage()
}

const editLanguage = async (lang) => {
  return await window.electronAPI.editLanguage(lang)
}

const chatGeneration = async (model, content) => {
  return await window.electronAPI.chatGeneration(model, content)
}

export {
  addNodeToFlow,
  createFlow,
  createNode,
  deleteFlow,
  deleteNode,
  editFlowTitle,
  editLanguage,
  editNodeContent,
  editNodeTitle,
  fetchFlow,
  fetchFlows,
  fetchNode,
  fetchNodesInFlow,
  getLanguage,
  removeNodeFromFlow,
  saveFlowThumbnail,
  updateNodeInFlow,
  uploadPhoto,
  chatGeneration,
}
