import { ipcMain } from 'electron'
import fetchFlows from './flows/fetchFlows.js'
import deleteFlow from './flows/deleteFlow.js'
import createFlow from './flows/createFlow.js'

const registerBackendAPIs = () => {
  ipcMain.handle('flows:createFlow', createFlow)
  ipcMain.handle('flows:fetchFlows', fetchFlows)
  ipcMain.handle('flows:deleteFlow', deleteFlow)
}

export default registerBackendAPIs
