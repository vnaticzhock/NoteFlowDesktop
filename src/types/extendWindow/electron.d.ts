interface ElectronAPI {
  fetchFlows(offset: number | string): Promise<any>;
  createFlow(): Promise<any>;
  deleteFlow(id: string): Promise<any>;
  saveFlowThumbnail(flowId: string, base64: any): Promise<any>;
  editFlowTitle(id: string, title: string): Promise<any>;
  createNode(): Promise<any>;
  editNodeTitle(id: string, newTitle: string): Promise<any>;
  editNodeContent(id: string, newContent: string): Promise<any>;
  deleteNode(id: string): Promise<any>;
  fetchNode(id: string): Promise<any>;
  addNodeToFavorite(id: string): Promise<any>;
  removeNodeFromFavorite(id: string): Promise<any>;
  fetchFavoriteNodes(): Promise<any>;
  fetchEdges(flowId: string): Promise<any>;
  addEdge(
    flowId: string,
    nodeIdSrc: string,
    nodeIdTgt: string,
    sourceHandle: string,
    targetHandle: string,
    style: string,
  ): Promise<any>;
  removeEdge(
    flowId: string,
    nodeIdSrc: string,
    nodeIdTgt: string,
    sourceHandle: string,
    targetHandle: string,
  ): Promise<any>;
  addNodeToFlow(
    flowId: string,
    nodeId: string,
    xpos: number,
    ypos: number,
    style: string,
  ): Promise<any>;
  removeNodeFromFlow(flowId: string, nodeId: string): Promise<any>;
  fetchNodesInFlow(flowId: string): Promise<any>;
  editNodeInFlow(flowId: string, nodeId: string, data: string): Promise<any>;
  uploadPhoto(photoPath: string): Promise<any>;
  getPhoto(): Promise<any>;
  getLanguage(): Promise<any>;
  editLanguage(language: string): Promise<any>;
  chatGeneration(model: string, content: string): Promise<any>;
  getInstalledModelList(): Promise<any>;
  getModelList(): Promise<any>;
  pullModel(model: string): Promise<any>;
  isPullingModel(): Promise<any>;
  getPullingProgress(): Promise<any>;
  getApiKeys(): Promise<any>;
  getDefaultApiKey(): Promise<any>;
  addApiKey(key: string): Promise<any>;
  updateDefaultApiKey(key: string): Promise<any>;
  removeApiKey(key: string): Promise<any>;
  removeProgressBar(): Promise<any>;
  setProgressBar(progress: number): Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
