// import React, { createContext, useContext, useRef, useState } from 'react'
// import * as Y from 'yjs'
// import { WebrtcProvider } from 'y-webrtc'
// import { WebsocketProvider } from 'y-websocket'
// import { useEdgesState, useNodesState } from 'reactflow'
// import { create } from 'zustand'
// import { immer } from 'zustand/middleware/immer'
// import { configureYmap } from '../apis/Yjs'
// import {
//   YjsAction,
//   YjsState,
//   YjsFlowState,
//   YArrayTypeMapper
// } from '../types/flow/yjs'

// // handle incremental changes.
// export const FlowYjsManager = ({ children }: any) => {
//   const activeFlowId = -1
//   // react flow
//   const [edges, setEdges, onEdgesChange] = useEdgesState([])
//   const [nodes, setNodes, onNodesChange] = useNodesState([])

//   // yjs
//   const ydoc = useYjsStore(state => state.ydoc)
//   const provider = useYjsStore(state => state.provider)
//   const initiateYjs = useYjsStore(state => state.initiateYjs)

//   return <></>
//   // return <FlowYjsContext.Provider>{children}</FlowYjsContext.Provider>
// }

// const useFlowYjsManager = () => useContext(FlowYjsContext)

// export { useFlowYjsManager }
