import * as Y from 'yjs'
import { YjsFlowState, YArrayTypeMapper } from '../types/flow/yjs'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import { Awareness } from 'y-protocols/awareness.js'

// let observing: Array<Y.Array<any>> = []
let ydoc: Y.Doc | null
let provider: WebrtcProvider | WebsocketProvider | null
let YJS = false
let awareness: Awareness | undefined

const onlineUsers = new Map()

const callback: {
  onUpdate: <K extends keyof YArrayTypeMapper>(type: K, payload: any) => void
} = {
  onUpdate: () => {}
}

const configureYdoc = <K extends keyof YArrayTypeMapper>(
  ydoc: Y.Doc,
  name: K,
  ls: YArrayTypeMapper[K][]
): Y.Map<YArrayTypeMapper[K]> => {
  const ymap = ydoc.getMap<YArrayTypeMapper[K]>(name)

  for (const each of ls) {
    ymap.set(each.id.toString(), each)
  }

  return ymap
}

const resolveYjsEvent = <K extends keyof YArrayTypeMapper>(
  event: Y.YMapEvent<YArrayTypeMapper[K]>,
  type: K,
  callback: (type: K, payload: any) => void
): void => {
  if (event.transaction.local) {
    // assumption: 自己做的事情，可以放著不理
    return
  }
  const ymap: Y.Map<YArrayTypeMapper[K]> = event.target
  const targets = event.keysChanged
  for (const target of targets) {
    const content = ymap.get(target)
    callback(type, {
      id: target,
      content: content
    })
  }
}

// 已經初始化完成
const initiateYjs = (ydoc: Y.Doc, flow_state: YjsFlowState): void => {
  const nodesYmap = configureYdoc(ydoc, 'nodes', flow_state.nodes)
  const edgesYmap = configureYdoc(ydoc, 'edges', flow_state.edges)

  nodesYmap.observe((event, transaction) => {
    resolveYjsEvent(event, 'nodes', callback.onUpdate)
  })

  edgesYmap.observe((event, transaction) => {
    resolveYjsEvent(event, 'edges', callback.onUpdate)
  })

  ydoc.getMap('default').set('is_inited', true)
}

// 進入已經存在的房間
const enterExistingYjs = (ydoc: Y.Doc): void => {
  ydoc
    .getMap<YArrayTypeMapper['nodes']>('nodes')
    .observe((event, transaction) => {
      resolveYjsEvent(event, 'nodes', callback.onUpdate)
    })

  ydoc
    .getMap<YArrayTypeMapper['edges']>('edges')
    .observe((event, transaction) => {
      resolveYjsEvent(event, 'edges', callback.onUpdate)
    })
}

const startYjs = (room_name: string, flow_state: YjsFlowState): void => {
  exitYjs()

  ydoc = new Y.Doc()

  // awareness = new Awareness(ydoc)
  // TODO: Call API to get nickname.
  // awareness.setLocalStateField('nickname', 'noteflow')
  // listenAwareness(awareness)

  provider = new WebsocketProvider('ws://localhost:1234', room_name, ydoc)
  provider.once('sync', isSynced => {
    if (!isSynced) {
      console.error('yjs websocket cannot be synced.')
      exitYjs()
      return
    }

    const ymap = ydoc!.getMap<any>('default')
    const is_inited = ymap.get('is_inited')

    if (!is_inited) {
      initiateYjs(ydoc!, flow_state)
    } else {
      enterExistingYjs(ydoc!)
    }

    if (provider?.awareness) {
      awareness = provider?.awareness
      awareness.setLocalStateField('nickname', 'noteflow')
      listenAwareness(awareness)
    }

    YJS = true
  })
}

// 這裡單純是將 instance 清除掉,
// 可能還要加入一個將 ws 裡面的 state 全部清除的功能
const exitYjs = (): void => {
  // observing = []
  ydoc?.destroy()
  provider?.destroy()
  awareness?.destroy()
  YJS = false
  onlineUsers.clear()
}

const updateComponent = <K extends keyof YArrayTypeMapper>(
  type: K,
  id: string,
  content: YArrayTypeMapper[K]
): void => {
  if (!ydoc) {
    console.error('ydoc not found.')
    return
  }
  const ymap = ydoc.getMap<YArrayTypeMapper[K]>(type)
  ymap?.set(id, content)
}

const deleteComponent = <K extends keyof YArrayTypeMapper>(
  type: K,
  id: string
): void => {
  if (!ydoc) {
    console.error('ydoc not found.')
    return
  }
  const ymap = ydoc.getMap<YArrayTypeMapper[K]>(type)
  ymap.delete(id)
}

const addComponent = <K extends keyof YArrayTypeMapper>(
  type: K,
  id: string,
  content: YArrayTypeMapper[K]
): void => {
  if (!ydoc) {
    console.error('ydoc not found.')
    return
  }
  const ymap = ydoc.getMap<YArrayTypeMapper[K]>(type)
  ymap.set(id, content)
}

const YjsCallbackUpdater = (onUpdate: never): void => {
  callback.onUpdate = onUpdate
}

const listenAwareness = (awareness: Awareness): void => {
  for (const state of awareness.getStates()) {
    onlineUsers.set(state[0], state[1])
  }

  // console.log('List of online users is updated:', onlineUsers)

  awareness.on('update', ({ added, updated, removed }) => {
    added.forEach((clientId: number) => {
      const state = awareness.getStates().get(clientId)
      onlineUsers.set(clientId, state)
    })

    updated.forEach((clientId: number) => {
      const state = awareness.getStates().get(clientId)
      onlineUsers.set(clientId, state)
    })

    removed.forEach((clientId: number) => {
      onlineUsers.delete(clientId)
    })

    // console.log('List of online users is updated:', onlineUsers)
  })
}

// 設定個人資料, 滑鼠位置等等.
const setAwarenessField = (key: string, value: any) => {
  if (!awareness) {
    console.error('Awareness is not set.')
    return
  }
  awareness.setLocalStateField(key, value)
}

export {
  configureYdoc,
  startYjs,
  exitYjs,
  deleteComponent,
  updateComponent,
  addComponent,
  YjsCallbackUpdater,
  setAwarenessField,
  YJS
}
