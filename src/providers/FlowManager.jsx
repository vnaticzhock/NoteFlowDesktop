import { toPng } from 'html-to-image'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useOutletContext } from 'react-router-dom'
import { getNodesBounds, getViewportForBounds } from 'reactflow'
import { useReactFlow } from 'reactflow'

import { saveFlowThumbnail, updateNodeInFlow } from '../apis/APIs'

const imageWidth = 256
const imageHeight = 168

const needUpdated = {
  nodes: {},
  edges: {},
}

const FlowManagementContext = createContext({
  activeFlowId: -1,
  rightClicked: '1',
  setRightClicked: () => {},
  updateNodeHelper: (id, data) => {},
  setActiveFlowId: (id) => {},
  allSynced: true,
  flush: () => {},
  updateFlow: () => {},
})

export const FlowManagementProvider = ({ children }) => {
  const [rightClicked, setRightClicked] = useState('')
  const [allSynced, setAllSynced] = useState(true)

  const { activeFlowId } = useOutletContext()
  const { getNodes } = useReactFlow()

  // node 更新的小幫手
  const updateNodeHelper = useCallback(
    (nodeId, data) => {
      if (!(activeFlowId in needUpdated)) {
        needUpdated[activeFlowId] = {}
      }

      if (!(nodeId in needUpdated[activeFlowId])) {
        needUpdated[activeFlowId][nodeId] = {}
      }

      needUpdated[activeFlowId][nodeId] = {
        ...needUpdated[activeFlowId][nodeId],
        ...data,
      }

      setAllSynced(false)
    },
    [activeFlowId],
  )

  const snapshot = useCallback(() => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library

    const view = document.querySelector('.react-flow__viewport')
    if (!view) return

    const nodesBounds = getNodesBounds(getNodes())
    const { x, y, zoom } = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
    )

    toPng(view, {
      backgroundColor: '#ffffff',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
      },
    }).then((res) => {
      saveFlowThumbnail(activeFlowId, res)
    })
  }, [getNodes, activeFlowId])

  // 將更新推到資料庫裡面
  const flush = useCallback(() => {
    for (let flowId in needUpdated) {
      for (let nodeId in needUpdated[flowId]) {
        const data = needUpdated[flowId][nodeId]
        updateNodeInFlow(flowId, nodeId, data)
      }
      delete needUpdated.flowId
    }

    setAllSynced(true)
    snapshot()
  }, [snapshot])

  useEffect(() => {
    if (allSynced) return

    const interval = setTimeout(flush, 3000)

    return () => clearTimeout(interval)
  }, [allSynced])

  useEffect(() => {
    if (!activeFlowId || activeFlowId < 0) return

    return () => {
      if (!allSynced) {
        console.log('flush')
        flush()
      }
    }
  }, [activeFlowId, allSynced])

  return (
    <FlowManagementContext.Provider
      value={{
        rightClicked,
        setRightClicked,
        updateNodeHelper,
        flush,
        activeFlowId,
        allSynced,
      }}
    >
      {children}
    </FlowManagementContext.Provider>
  )
}

const useFlowManager = () => useContext(FlowManagementContext)

export { useFlowManager }
