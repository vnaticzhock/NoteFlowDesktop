import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const whisperCppFolder = '../../../whisper.cpp'

const valid_models = fs.readFileSync('./valid_model.txt', 'utf-8').split('\n')

const isValidModels = path => {
  return valid_models.includes(path)
}

const isInstalledModels = model => {
  const file_name = `ggml-${model}.bin`
  const file_path = path.join(whisperCppFolder, 'models', file_name)

  return fs.existsSync(file_path)
}

const listInstalledModels = () => {
  return valid_models.filter(each => {
    return isInstalledModels(each)
  })
}

const downloadModel = async (model, callback) => {
  if (!isValidModels(model)) {
    return false
  }
  if (isInstalledModels(model)) {
    return false
  }
  const command = `bash ${whisperCppFolder}/models/download-ggml-model.sh ${model}`

  const child = exec(command)

  // child.std
  child.stdout?.on('data', data => {
    const progressRegex =
      /\[([=> ]+)\]\s*(\d+\.\d+%)\s*(\d+\.\d+\w\/s)\s*in\s*(\d+\.\d+s)/
    const match = data.match(progressRegex)
    if (match) {
      const progressBar = match[1]
      const percentage = parseInt(match[2])
      const speed = match[3]
      const time = match[4]

      // 將解析後的進度資訊傳回到前端
      // 這裡可以使用WebSocket、HTTP請求或其他通訊方式傳送資料到前端
      console.log(`Progress: ${percentage}, Speed: ${speed}, Time: ${time}`)
      // callback(percentage, false)
    }
  })

  let lastPercentage = ''

  child.stderr.on('data', data => {
    const progressRegex = /[\d]+\%/
    const result = data.match(progressRegex)
    if (!result) return

    const percentage = result[0]
    if (percentage != lastPercentage) {
      lastPercentage = percentage
      callback(percentage, false)
    }
  })

  child.on('close', code => {
    callback('100%', true)
  })

  return true
}

downloadModel('tiny.en', (percentage, done) => {
  console.log(percentage, done)
})
