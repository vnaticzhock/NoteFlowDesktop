import { toPng } from 'html-to-image'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { useOutletContext } from 'react-router-dom'
import { getNodesBounds, getViewportForBounds, useReactFlow } from 'reactflow'

import {
  editNodeContent,
  saveFlowThumbnail,
  updateNodeInFlow
} from '../apis/APIs'

const imageWidth = 256
const imageHeight = 168
let needUpdated = {}

const FlowManagementContext = createContext({
  activeFlowId: -1,
  updateNodeHelper: (id, data) => {},
  updateEditorContent: async (id, content) => {},
  setActiveFlowId: id => {},
  allSynced: true,
  flush: () => {},
  updateFlow: () => {}
})

export const FlowManagementProvider = ({ children }) => {
  const [allSynced, setAllSynced] = useState(true)
  const { activeFlowId } = useOutletContext()
  const { getNodes } = useReactFlow()

  // node 更新的小幫手

  const updateEditorContent = async (nodeId, content) => {
    await editNodeContent(nodeId, content)
  }

  const snapshot = useCallback(() => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    if (activeFlowId === -1) return

    const view = document.querySelector('.react-flow__viewport')
    if (!view) return

    const nodesBounds = getNodesBounds(getNodes())
    const { x, y, zoom } = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    )

    toPng(view, {
      backgroundColor: '#ffffff',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${x}px, ${y}px) scale(${zoom})`
      }
    }).then(res => {
      saveFlowThumbnail(activeFlowId, res)
    })
  }, [getNodes, allSynced, activeFlowId])

  // 將更新推到資料庫裡面
  const flush = useCallback(() => {
    for (const flowId in needUpdated) {
      for (const nodeId in needUpdated[flowId]) {
        const data = needUpdated[flowId][nodeId]
        updateNodeInFlow(flowId, nodeId, data.data)
      }
    }
    needUpdated = {}

    setAllSynced(true)
    snapshot()
  }, [activeFlowId])

  useEffect(() => {
    if (allSynced) return
    const interval = setTimeout(flush, 300)
    return () => clearTimeout(interval)
  }, [allSynced])

  useEffect(() => {
    if (!activeFlowId) return

    return () => {
      if (!allSynced) {
        flush()
      }
    }
  }, [activeFlowId, allSynced])

  const updateNodeHelper = (nodeId, data) => {
    if (activeFlowId === -1) return

    if (!(activeFlowId in needUpdated)) {
      needUpdated[activeFlowId] = {}
    }

    if (!(nodeId in needUpdated[activeFlowId])) {
      needUpdated[activeFlowId][nodeId] = {}
    }

    needUpdated[activeFlowId][nodeId] = {
      ...needUpdated[activeFlowId][nodeId],
      data
    }

    setAllSynced(false)
  }

  return (
    <FlowManagementContext.Provider
      value={{
        activeFlowId,
        allSynced,
        updateNodeHelper,
        updateEditorContent,
        flush
      }}>
      {children}
    </FlowManagementContext.Provider>
  )
}

const useFlowManager = () => useContext(FlowManagementContext)

export { useFlowManager }
