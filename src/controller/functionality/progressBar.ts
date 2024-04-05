import { mainWindow } from '../../../main.js'

const setProgressBar = (_, progress): void => {
  mainWindow.setProgressBar(progress)
  console.log('set progress bar:', progress)
}

const removeProgressBar = (_): void => {
  mainWindow.setProgressBar(-1)
  console.log('progress bar removed')
}

export { removeProgressBar, setProgressBar }
