import ollama from 'ollama'

import {
  removeProgressBar,
  setProgressBar,
} from '../functionality/progressBar.js'

// content: [{ role: 'user', content: 'why is the sky blue?' }]

const chatGeneration = async (_, model, content) => {
  const response = await ollama.chat({
    model: model,
    messages: content,
  })

  return response
}

const getInstalledModelList = async () => {
  const model_list = await ollama.list()
  return model_list.models.map((each, index) => {
    const { model, modified_at, digest } = each
    const { parameter_size, quantization_level } = each.details

    const name = model.split(':')[0]
    const version = model.split(':')[1]

    return {
      name,
      version,
      modified_at,
      parameter_size,
      quantization_level,
      digest,
    }
  })
}

const getModelList = async () => {
  const installedList = await getInstalledModelList()

  const installed = []
  const uninstalled = []

  MODELS_LIST.forEach((each, index) => {
    // if any
    for (let i = 0; i < installedList.length; i++) {
      if (installedList[i].name === each.name) {
        installed.push({
          ...installedList[i],
          ...each,
        })
        return
      }
    }

    // else
    uninstalled.push({
      ...each,
    })
  })

  return {
    installed,
    uninstalled,
  }
}

const pullModel = async (_, model) => {
  const progress = await ollama.pull({ model, stream: true })

  PULLING_LIST.push([model, progress])

  // 不回傳結果回去，因為 progress 不能被 clone 到 renderer thread
  // 因此，我們需要在後端處理下載的邏輯 (getPullingProgress)
}

const isPullingModel = () => {
  console.log('Number of models installing:', PULLING_LIST.length)
  return PULLING_LIST.length !== 0
}

const getPullingProgress = async (_) => {
  const removed = []

  // de-promise an array of promise
  const result = await Promise.all(
    PULLING_LIST.map(async (each, index) => {
      const model_name = each[0]
      const progress_bar = each[1]

      const { value, done } = await progress_bar.next()

      if (done) {
        removed.push(index)
      }

      return {
        name: model_name,
        total: value.total,
        completed: value.completed,
        done: done,
      }
    }),
  )

  PULLING_LIST = PULLING_LIST.filter((each, index) => !removed.includes(index))

  const progress = result.reduce(
    (acc, each) => [acc[0] + each.total, acc[1] + each.completed],
    [0, 0],
  )
  const TOTAL = progress[0]
  const COMPLETED = progress[1]

  if (COMPLETED < TOTAL) {
    setProgressBar(_, COMPLETED / TOTAL)
  } else {
    removeProgressBar()
  }

  return result
}

let PULLING_LIST = []

const MODELS_LIST = [
  {
    id: 'llama2', // ollama pull ... 的時候使用的名字
    name: 'llama2', // 顯示出來的名字
    description:
      'Llama 2 is a collection of foundation language models ranging from 7B to 70B parameters.',
  },
  {
    id: 'mistral',
    name: 'mistral',
    description: 'The 7B model released by Mistral AI, updated to version 0.2.',
  },
  {
    id: 'Breeze-7B',
    name: 'Breeze-7B',
    description:
      'MediaTek Research Breeze-7B (hereinafter referred to as Breeze-7B)\
      is a language model family that builds on top of Mistral-7B,\
      specifically intended for Traditional Chinese use.',
  },
]

export {
  chatGeneration,
  getInstalledModelList,
  getModelList,
  getPullingProgress,
  isPullingModel,
  pullModel,
}
