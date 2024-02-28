const fetchFlows = async (page) => {
  return await window.electronAPI.fetchFlows(page)
}

const createFlow = async () => {
  return await window.electronAPI.createFlow()
}

const deleteFlow = async (id) => {
  return await window.electronAPI.deleteFlow(id)
}

export { fetchFlows, createFlow, deleteFlow }
