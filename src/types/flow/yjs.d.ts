import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import { Edge, Node } from 'reactflow'
import * as Y from 'yjs'

type YArrayTypeMapper = {
  nodes: Node
  edges: Edge
}

type YjsState = {
  ydoc: Y.Doc | null
  provider: WebrtcProvider | WebsocketProvider | null
  observing: Y.Array<any>[]
}

type YjsFlowState = {
  nodes: Node[]
  edges: Edge[]
  onUpdate: <K extends keyof YArrayTypeMapper>(
    type: K,
    id: number,
    content: YArrayTypeMapper[K]
  ) => void
  onDelete: <K extends keyof YArrayTypeMapper>(type: K, id: number) => void
  onAdd: <K extends keyof YArrayTypeMapper>(
    type: K,
    id: number,
    content: YArrayTypeMapper[K]
  ) => void
}

type YjsAction = {
  initiateYjs: (
    room_name: string,
    flow_state: YjsFlowState,
    neww: boolean
  ) => void
  enterYjs: (room_name: string) => void
  exitYjs: () => void
  updateComponent: <K extends keyof YArrayTypeMapper>(
    type: K,
    id: number,
    content: YArrayTypeMapper[K]
  ) => void
  deleteComponent: <K extends keyof YArrayTypeMapper>(
    type: K,
    id: number
  ) => void
  addComponent: <K extends keyof YArrayTypeMapper>(
    type: K,
    id: number,
    content: YArrayTypeMapper[K]
  ) => void
}

export type { YArrayTypeMapper, YjsState, YjsFlowState, YjsAction }
