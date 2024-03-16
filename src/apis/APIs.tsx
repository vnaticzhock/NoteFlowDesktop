const fetchFlows = async (offset: number) => {
  return await window.electronAPI.fetchFlows(offset);
};

const fetchFlow = async (id: string) => {
  return await window.electronAPI.fetchFlows(id);
};

const createFlow = async () => {
  return await window.electronAPI.createFlow();
};

const deleteFlow = async (id: string) => {
  return await window.electronAPI.deleteFlow(id);
};

const saveFlowThumbnail = async (flowId: string, base64: any) => {
  return await window.electronAPI.saveFlowThumbnail(flowId, base64);
};

const editFlowTitle = async (id: string, title: string) => {
  return await window.electronAPI.editFlowTitle(id, title);
};

const createNode = async () => {
  return await window.electronAPI.createNode();
};

const editNodeTitle = async (id: string, newTitle: string) => {
  return await window.electronAPI.editNodeTitle(id, newTitle);
};

const editNodeContent = async (id: string, newContent: string) => {
  return await window.electronAPI.editNodeContent(id, newContent);
};

const deleteNode = async (id: string) => {
  return await window.electronAPI.deleteNode(id);
};

const fetchNode = async (id: string) => {
  return await window.electronAPI.fetchNode(id);
};

const addNodeToFavorite = async (id: string) => {
  return await window.electronAPI.addNodeToFavorite(id);
};

const removeNodeFromFavorite = async (id: string) => {
  return await window.electronAPI.removeNodeFromFavorite(id);
};

const fetchFavoriteNodes = async () => {
  return await window.electronAPI.fetchFavoriteNodes();
};

const fetchEdges = async (flowId: string) => {
  return await window.electronAPI.fetchEdges(flowId);
};

const addEdgeInFlow = async (
  flowId: string,
  nodeIdSrc: string,
  nodeIdTgt: string,
  sourceHandle: string,
  targetHandle: string,
  style: string,
) => {
  return await window.electronAPI.addEdge(
    flowId,
    nodeIdSrc,
    nodeIdTgt,
    sourceHandle,
    targetHandle,
    style,
  );
};

const removeEdgeFromFlow = async (
  flowId: string,
  nodeIdSrc: string,
  nodeIdTgt: string,
  sourceHandle: string,
  targetHandle: string,
) => {
  return await window.electronAPI.removeEdge(
    flowId,
    nodeIdSrc,
    nodeIdTgt,
    sourceHandle,
    targetHandle,
  );
};

const addNodeToFlow = async (
  flowId: string,
  nodeId: string,
  xpos: number,
  ypos: number,
  style: string,
) => {
  return await window.electronAPI.addNodeToFlow(
    flowId,
    nodeId,
    xpos,
    ypos,
    style,
  );
};

const removeNodeFromFlow = async (flowId: string, nodeId: string) => {
  return await window.electronAPI.removeNodeFromFlow(flowId, nodeId);
};

const fetchNodesInFlow = async (flowId: string) => {
  return await window.electronAPI.fetchNodesInFlow(flowId);
};

const updateNodeInFlow = async (
  flowId: string,
  nodeId: string,
  data: string,
) => {
  return await window.electronAPI.editNodeInFlow(flowId, nodeId, data);
};

const uploadPhoto = async (photoPath: string) => {
  return await window.electronAPI.uploadPhoto(photoPath);
};

const getPhoto = async () => {
  return await window.electronAPI.getPhoto();
};

const getLanguage = async () => {
  return await window.electronAPI.getLanguage();
};

const editLanguage = async (language: string) => {
  return await window.electronAPI.editLanguage(language);
};

const chatGeneration = async (model: string, content: string) => {
  return await window.electronAPI.chatGeneration(model, content);
};

const getInstalledModelList = async () => {
  return await window.electronAPI.getInstalledModelList();
};

const getModelList = async () => {
  return await window.electronAPI.getModelList();
};

const pullModel = async (model: string) => {
  return await window.electronAPI.pullModel(model);
};

const isPullingModel = async () => {
  return await window.electronAPI.isPullingModel();
};

const getPullingProgress = async () => {
  return await window.electronAPI.getPullingProgress();
};

const getApiKeys = async () => {
  return await window.electronAPI.getApiKeys();
};

const getChatGPTDefaultApiKey = async () => {
  return await window.electronAPI.getDefaultApiKey();
};

const addChatGPTApiKey = async (key: string) => {
  return await window.electronAPI.addApiKey(key);
};

const updateChatGPTDefaultApiKey = async (key: string) => {
  return await window.electronAPI.updateDefaultApiKey(key);
};

const removeChatGPTApiKey = async (key: string) => {
  return await window.electronAPI.removeApiKey(key);
};

const removeProgressBar = async () => {
  return await window.electronAPI.removeProgressBar();
};

const setProgressBar = async (progress: number) => {
  return await window.electronAPI.setProgressBar(progress);
};

const DEFAULT_MODELS = ["GPT-3.5", "GPT-4"];

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
};
