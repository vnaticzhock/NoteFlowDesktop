import * as Y from 'yjs'
import { YjsFlowState, YArrayTypeMapper } from '../types/flow/yjs'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'

// let observing: Array<Y.Array<any>> = []
let ydoc: Y.Doc | null
let provider: WebrtcProvider | WebsocketProvider | null
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
) => {
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

const initiateYjs = (ydoc: Y.Doc, flow_state: YjsFlowState): void => {
  const nodesYmap = configureYdoc(ydoc, 'nodes', flow_state.nodes)
  const edgesYmap = configureYdoc(ydoc, 'edges', flow_state.edges)

  nodesYmap.observe((event, transaction) => {
    resolveYjsEvent(event, 'nodes', callback.onUpdate)
  })

  edgesYmap.observe((event, transaction) => {
    console.log(event)
    resolveYjsEvent(event, 'edges', callback.onUpdate)
    // resolveYjsEvent(event, 'edges', () => {})
  })

  ydoc.getMap('default').set('is_inited', true)
}

const enterExistingYjs = (ydoc: Y.Doc): void => {
  ydoc
    .getMap<YArrayTypeMapper['nodes']>('nodes')
    .observe((event, transaction) => {
      resolveYjsEvent(event, 'nodes', callback.onUpdate)
    })

  ydoc
    .getMap<YArrayTypeMapper['edges']>('edges')
    .observe((event, transaction) => {
      console.log(event)
      resolveYjsEvent(event, 'edges', callback.onUpdate)
    })

  // observing.push(...[nodesArray, edgesArray])
}

const startYjs = (room_name: string, flow_state: YjsFlowState): void => {
  exitYjs()

  ydoc = new Y.Doc()

  provider = new WebsocketProvider('ws://localhost:1234', room_name, ydoc)
  provider.once('sync', isSynced => {
    const ymap = ydoc!.getMap<any>('default')
    const is_inited = ymap.get('is_inited')

    if (!is_inited) {
      initiateYjs(ydoc!, flow_state)
    } else {
      enterExistingYjs(ydoc!)
    }
  })
}

const exitYjs = (): void => {
  // observing = []
  ydoc?.destroy()
  provider?.destroy()
}

const updateComponent = <K extends keyof YArrayTypeMapper>(
  type: K,
  id: number,
  content: YArrayTypeMapper[K]
): void => {
  console.assert(ydoc, 'ydoc is null')
  const array = ydoc?.getArray<YArrayTypeMapper[K]>(type)
  console.assert(array, 'array is null')
  const element = array?.get(id)
  // array.
}

const deleteComponent = <K extends keyof YArrayTypeMapper>(
  type: K,
  id: number
): void => {
  const array = ydoc?.getArray<YArrayTypeMapper[K]>(type)
  array?.delete(id)
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

const YjsCallbackUpdater = (onUpdate: any) => {
  callback.onUpdate = onUpdate
}

export {
  configureYdoc,
  startYjs,
  exitYjs,
  deleteComponent,
  updateComponent,
  addComponent,
  YjsCallbackUpdater
}
