import { mainWindow } from '../../../main.js'

const setProgressBar = (_, progress) => {
  mainWindow.setProgressBar(progress)
  console.log('set progress bar:', progress)
}

const removeProgressBar = (_) => {
  mainWindow.setProgressBar(-1)
}

export { removeProgressBar, setProgressBar }
