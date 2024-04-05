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
}

type YjsFlowState = {
  nodes: Node[]
  edges: Edge[]
  onUpdate: <K extends keyof YArrayTypeMapper>(type: K, payload: any) => void
}

type YjsAction = {
  startYjs: (room_name: string, flow_state: YjsFlowState) => void
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
