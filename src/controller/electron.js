import { ipcMain } from 'electron'
import { fetchFlows, deleteFlows, createFlows } from './flows/index.js'

const registerBackendAPIs = () => {
  ipcMain.handle('flows:fetchFlows', fetchFlows)
  ipcMain.handle('flows:deleteFlows', deleteFlows)
  ipcMain.handle('flows:createFlows', createFlows)
}

export default registerBackendAPIs
