import React, { createContext, useContext, useRef, useState } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import { useEdgesState, useNodesState } from 'reactflow'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { configureYmap } from '../apis/Yjs'
import {
  YjsAction,
  YjsState,
  YjsFlowState,
  YArrayTypeMapper
} from 'src/types/flow/yjs'

const FlowYjsContext = createContext({})

const useYjsStore = create<YjsState & YjsAction>()(
  immer(set => ({
    ydoc: null,
    provider: null,
    observing: [],
    exitYjs: (): void =>
      set(state => {
        state.observing.forEach(each => {
          each.unobserve(() => {})
        })
        state.observing = []
        state.ydoc?.destroy()
        state.provider?.destroy()
      }),
    initiateYjs: (room_name: string, flow_state: YjsFlowState): void =>
      set(state => {
        console.assert(state.observing.length === 0, 'observings not cleared')

        state.ydoc = new Y.Doc()
        state.provider = new WebsocketProvider('', room_name, state.ydoc)

        const ymap = state.ydoc.getMap<any>()

        const nodesArray = configureYmap(ymap, 'nodes', flow_state.nodes)
        const edgesArray = configureYmap(ymap, 'edges', flow_state.edges)

        nodesArray.observe((event, transaction) => {
          console.log('變動', event)
        })

        edgesArray.observe((event, transaction) => {
          console.log('變動2', event)
        })

        state.observing.push(...[nodesArray, edgesArray])
      }),
    enterYjs: (room_name: string): void =>
      set(state => {
        // 相對於 initiateYjs，這個函數會被用於加入一個已經存在的房間
        console.assert(state.observing.length === 0, 'observings not cleared')

        state.ydoc = new Y.Doc()
        state.provider = new WebsocketProvider('', room_name, state.ydoc)

        const ymap = state.ydoc.getMap<any>()

        const nodesArray = ymap.get('nodes')
        nodesArray.observe((event, transaction) => {
          console.log('變動', event)
        })

        const edgesArray = ymap.get('edges')
        edgesArray.observe((event, transaction) => {
          console.log('變動', event)
        })

        state.observing.push(...[nodesArray, edgesArray])
      }),
    updateComponent: <K extends keyof YArrayTypeMapper>(
      type: K,
      id: number,
      content: YArrayTypeMapper[K]
    ): void =>
      set(state => {
        console.assert(state.ydoc, 'ydoc is null')
        const array = state.ydoc?.getArray<YArrayTypeMapper[K]>(type)
        console.assert(array, 'array is null')
        const element = array?.get(id)
        // array.
      }),
    deleteComponent: <K extends keyof YArrayTypeMapper>(
      type: K,
      id: number
    ): void =>
      set(state => {
        console.assert(state.ydoc, 'ydoc is null')
        const array = state.ydoc?.getArray<YArrayTypeMapper[K]>(type)
        console.assert(array, 'array is null')
        array?.delete(id)
      }),
    addComponent: <K extends keyof YArrayTypeMapper>(
      type: K,
      id: number,
      content: YArrayTypeMapper[K]
    ): void =>
      set(state => {
        console.assert(state.ydoc, 'ydoc is null')
        const array = state.ydoc?.getArray<YArrayTypeMapper[K]>(type)
        console.assert(array, 'array is null')
        array?.insert(id, [content])
      })
  }))
)

// handle incremental changes.
export const FlowYjsManager = ({ children }: any) => {
  const activeFlowId = -1
  // react flow
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])

  // yjs
  const ydoc = useYjsStore(state => state.ydoc)
  const provider = useYjsStore(state => state.provider)
  const initiateYjs = useYjsStore(state => state.initiateYjs)

  return <></>
  // return <FlowYjsContext.Provider>{children}</FlowYjsContext.Provider>
}

const useFlowYjsManager = () => useContext(FlowYjsContext)

export { useFlowYjsManager }
