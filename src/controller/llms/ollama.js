import ollama from 'ollama'

import {
  removeProgressBar,
  setProgressBar,
} from '../functionality/progressBar.js'

// content: [{ role: 'user', content: 'why is the sky blue?' }]

const chatGeneration = async (model, content) => {
  const response = await ollama.chat({
    model: model,
    messages: content,
  })

  return response
}

const isOllamaServicing = async () => {
  try {
    const model_list = await ollama.list()
    return true
  } catch (error) {
    return false
  }
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

  PULLING_LIST.push([
    model,
    progress,
    {
      total: undefined,
      completed: undefined,
    },
  ])
  // 不回傳結果回去，因為 progress 不能被 clone 到 renderer thread
  // 因此，我們需要在後端處理下載的邏輯 (getPullingProgress)

  maintainPullingProgress()
  // 並且, 後端會一直在處理下載的事情, 前端來問的時候才可以回傳狀態
}

const maintainPullingProgress = async (_) => {
  // TODO: 考慮用多執行緒的方式執行?
  PULLING_LIST.filter(async (each, index) => {
    const progress_bar = each[1]

    // const { value, done } = await progress_bar.next()
    let value, done
    let progress = await progress_bar.next()
    while (!progress.done) {
      value = progress.value
      done = progress.done

      each[2] = {
        total: value.total,
        completed: value.completed,
      }

      progress = await progress_bar.next()
    }

    // 處理完邏輯後，如果還沒下載完，則在這個 list 中留下來
    return !done
  })

  const progressInterval = setInterval(() => {
    const progress = PULLING_LIST.reduce(
      (acc, each) => [acc[0] + each[2].total, acc[1] + each[2].completed],
      [0, 0],
    )
    const TOTAL = progress[0]
    const COMPLETED = progress[1]

    if (COMPLETED >= TOTAL || PULLING_LIST.length === 0) {
      removeProgressBar()
      clearInterval(progressInterval)
      if (COMPLETED >= TOTAL) {
        PULLING_LIST = []
      }
    } else if (COMPLETED && TOTAL) {
      setProgressBar(_, COMPLETED / TOTAL)
    }
  }, 1000)
}

const isPullingModel = () => {
  console.log('Number of models installing:', PULLING_LIST.length)
  return PULLING_LIST.length !== 0
}

const getPullingProgress = async (_) => {
  return PULLING_LIST.map((each, index) => {
    return {
      name: each[0],
      total: each[2].total,
      completed: each[2].completed,
    }
  })
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
  {
    id: 'phi',
    name: 'phi',
    description:
      'Phi-2: a 2.7B language model by Microsoft Research that demonstrates outstanding reasoning and language understanding capabilities. ',
  },
]

export {
  chatGeneration,
  getInstalledModelList,
  getModelList,
  getPullingProgress,
  isOllamaServicing,
  isPullingModel,
  pullModel,
}
