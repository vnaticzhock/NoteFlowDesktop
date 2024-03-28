import { toPng } from 'html-to-image'
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getNodesBounds, getViewportForBounds, useReactFlow } from 'reactflow'
import {
  editNodeContent,
  saveFlowThumbnail,
  updateNodeInFlow
} from '../apis/APIs'
import {
  FlowManagementContext,
  imageHeight,
  imageWidth,
  needUpdated
} from './FlowManager'

export const FlowManagementProvider = ({ children }) => {
  const [allSynced, setAllSynced] = useState(true)

  // const { activeFlowId } = useOutletContext()
  const [activeFlowId, setActiveFlowId] = useState(-1)
  const { getNodes } = useReactFlow()
  const location = useLocation()

  // node 更新的小幫手
  // flowId
  const updateEditorContent = useCallback(async (nodeId, content) => {
    await editNodeContent(nodeId, content)
  }, [])

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
  }, [getNodes, activeFlowId])

  // 將更新推到資料庫裡面
  const flush = useCallback(() => {
    for (let flowId in needUpdated) {
      for (let nodeId in needUpdated[flowId]) {
        console.log('nodeid: ', nodeId)
        const data = needUpdated[flowId][nodeId]
        updateNodeInFlow(flowId, nodeId, data)
      }
    }
    needUpdated = {}

    setAllSynced(true)
    snapshot()
  }, [snapshot])

  useEffect(() => {
    if (id) {
      setActiveFlowId(id)
      console.log('id: ', id)
    }
  }, [location])

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
    const searchParams = new URLSearchParams(location.search)
    const id = parseInt(searchParams.get('flow_id'))
    if (id) {
      setActiveFlowId(id)
      console.log('id: ', id)
    }
    console.log('activeFlowId: ', activeFlowId)
    if (activeFlowId === -1) return
    if (!(activeFlowId in needUpdated)) {
      needUpdated[activeFlowId] = {}
    }

    if (!(nodeId in needUpdated[activeFlowId])) {
      needUpdated[activeFlowId][nodeId] = {}
    }

    needUpdated[activeFlowId][nodeId] = {
      ...needUpdated[activeFlowId][nodeId],
      ...data
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
