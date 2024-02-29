import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Panel, getRectOfNodes, getTransformForBounds } from 'reactflow'
import { toPng } from 'html-to-image'
import { updateNodeInFlow, saveFlowThumbnail } from '../apis/APIs'
import { useOutletContext } from 'react-router-dom'
import { useReactFlow } from 'reactflow'

const imageWidth = 256
const imageHeight = 168

const needUpdated = {
  nodes: {},
  edges: {},
}

const FlowManagementContext = createContext({
  flowId: '1',
  rightClicked: '1',
  setRightClicked: () => {},
  needUpdatedHandler: () => {},
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
      ...data,
    }
    setHasUpdated(false)
  }

  const snapshot = useCallback(() => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getRectOfNodes(getNodes())
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
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
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then((res) => {
      saveFlowThumbnail(flowId, res)
    })
  }, [getNodes, flowId])

  useEffect(() => {
    if (hasUpdated) return

    const interval = setTimeout(() => {
      for (let key in needUpdated.nodes) {
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
      clearTimeout(interval)
    }, 2000)

    // return () => clearTimeout(interval)
  }, [flowId, hasUpdated])

  return (
    <FlowManagementContext.Provider
      value={{ rightClicked, setRightClicked, needUpdatedHandler, flowId }}
    >
      {children}
    </FlowManagementContext.Provider>
  )
}

const useFlowManager = () => useContext(FlowManagementContext)

export { useFlowManager }
