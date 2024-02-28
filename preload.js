/* eslint-disable no-undef */
const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  fetchFlows: (page) => ipcRenderer.invoke('flows:fetchFlows', page),
  deleteFlow: (id) => ipcRenderer.invoke('flows:deleteFlow', id),
  createFlow: () => ipcRenderer.invoke('flows:createFlow'),
})
