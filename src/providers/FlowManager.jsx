import { toPng } from 'html-to-image'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import {
  getNodesBounds,
  getViewportForBounds,
  Panel,
  useReactFlow
} from 'reactflow'

import { saveFlowThumbnail, updateNodeInFlow } from '../apis/APIs'

const imageWidth = 256
const imageHeight = 168

const needUpdated = {
  nodes: {},
  edges: {}
}

const FlowManagementContext = createContext({
  flowId: '1',
  rightClicked: '1',
  setRightClicked: () => {},
  needUpdatedHandler: (nodesOrEdges, id, data) => {}
})

export const FlowManagementProvider = ({ children }) => {
  const [rightClicked, setRightClicked] = useState()
  const { getNodes } = useReactFlow()
  const [hasUpdated, setHasUpdated] = useState(true)

  const context = useOutletContext()
  const flowId = context.activeFlowId

  const needUpdatedHandler = (nodesOrEdges, id, data) => {
    if (!(id in needUpdated[nodesOrEdges])) {
      needUpdated[nodesOrEdges][id] = {}
    }
    needUpdated[nodesOrEdges][id] = {
      ...needUpdated[nodesOrEdges][id],
      ...data
    }
    setHasUpdated(false)
  }

  const snapshot = useCallback(() => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library

    const nodesBounds = getNodesBounds(getNodes())

    const { x, y, zoom } = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    )

    const view = document.querySelector('.react-flow__viewport')
    if (!view) return
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
      saveFlowThumbnail(flowId, res)
    })
  }, [getNodes, flowId])

  useEffect(() => {
    if (hasUpdated) return

    const interval = setTimeout(() => {
      for (const key in needUpdated.nodes) {
        const data = needUpdated.nodes[key]
        updateNodeInFlow(flowId, key, data)
      }
      // for (let key in needUpdated.nodes) {
      // const data = needUpdated.nodes[key]
      // editNodeInFlow(flowId, key, data)
      // }

      delete needUpdated.nodes
      needUpdated.nodes = {}
      delete needUpdated.edges
      needUpdated.edges = {}

      setHasUpdated(true)

      snapshot()
      // clearTimeout(interval)
    }, 300)

    return () => clearTimeout(interval)
  }, [flowId, hasUpdated])

  return (
    <FlowManagementContext.Provider
      value={{ rightClicked, setRightClicked, needUpdatedHandler, flowId }}>
      {children}
    </FlowManagementContext.Provider>
  )
}

const useFlowManager = () => useContext(FlowManagementContext)

export { useFlowManager }
