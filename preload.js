/* eslint-disable no-undef */
const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  fetchFlows: () => ipcRenderer.invoke('flows:fetchFlows'),
})
