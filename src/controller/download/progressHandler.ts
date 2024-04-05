import { IPullingModel } from '../../types/llms/llm.js'
import {
  removeProgressBar,
  setProgressBar
} from '../functionality/progressBar.js'

import { ProgressResponse } from 'ollama'

interface PullingModelState {
  name: string
  generator?: AsyncGenerator<ProgressResponse, any, unknown>
  total: number
  completed: number
}

const createArrayProxy = (): PullingModelState[] => {
  const handler: ProxyHandler<PullingModelState[]> = {
    set(target, property, value) {
      const wasEmpty = target.length === 0
      target[property] = value
      const isEmpty = target.length === 0

      if (wasEmpty !== isEmpty) {
        progressBarHandler()
      }

      return true
    }
  }

  const pulling_list: PullingModelState[] = []

  return new Proxy(pulling_list, handler)
}

let PULLING_LIST: PullingModelState[] = createArrayProxy()

// 把 model 加進去
const addToPulling = (data: PullingModelState): void => {
  PULLING_LIST.push(data)

  // ollama 有 generator, 可以透過這個管理
  // 但是 whisper 沒有 generator, 所以我會寫 code 處理這個部分
  if (data.generator) {
    void maintainSingleProgress(data)
  }
}

const maintainSingleProgress = async (
  data: PullingModelState
): Promise<void> => {
  const { generator } = data
  let progress = await generator!.next()

  while (!progress.done) {
    const { total, completed } = progress.value

    data.total = total
    data.completed = completed

    progress = await generator!.next()

    if (progress.done) {
      filterProgress(data.name)
      break
    }
  }
}

const filterProgress = (model: string): void => {
  PULLING_LIST = PULLING_LIST.filter(each => {
    return each.name !== model
  })
}

const progressBarHandler = (): void => {
  const progressInterval = setInterval(() => {
    console.log(PULLING_LIST)
    const progress = PULLING_LIST.reduce(
      (acc, each) => [acc[0] + each.total, acc[1] + each.completed],
      [0, 0]
    )
    const TOTAL = progress[0]
    const COMPLETED = progress[1]

    if (COMPLETED >= TOTAL || PULLING_LIST.length === 0) {
      removeProgressBar('')
      clearInterval(progressInterval)
      if (COMPLETED >= TOTAL) {
        PULLING_LIST.length = 0
      }
    } else if (COMPLETED && TOTAL) {
      setProgressBar('', COMPLETED / TOTAL)
    }
  }, 1000)
}

const isPullingModel = (): boolean => {
  console.log('Number of models installing:', PULLING_LIST.length)
  return PULLING_LIST.length !== 0
}

const getPullingProgress = (_): Array<IPullingModel> => {
  return PULLING_LIST.map(each => {
    const { name, total, completed } = each
    return {
      name,
      total,
      completed
    }
  })
}

export { getPullingProgress, isPullingModel, addToPulling, filterProgress }
