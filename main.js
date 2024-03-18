import { app, BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import registerBackendAPIs from './src/controller/electron.js';
const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1500,
        height: 860,
        webPreferences: {
            // so that we can use node.js api!
            preload: join(__dirName, 'preload.js'),
            contextIsolation: true
        }
    });
    console.log('open:', join(__dirName, 'preload.js'));
    // mainWindow.webContents.send()
    if (isDev) {
        // 開發階段直接與 React 連線
        mainWindow.loadURL('http://localhost:3000/');
        // 開啟 DevTools.
        mainWindow.webContents.openDevTools();
    }
    else {
        // 產品階段直接讀取 React 打包好的
        mainWindow.loadFile('./build/index.html');
    }
}
app.whenReady().then(() => {
    registerBackendAPIs(); // customed!
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('window-all-closed', function () {
    // eslint-disable-next-line no-undef
    if (process.platform !== 'darwin')
        app.quit();
});
export { mainWindow };
