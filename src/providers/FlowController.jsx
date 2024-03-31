import { BlockNoteEditor } from '@blocknote/core'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  Position,
  addEdge,
  updateEdge,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useViewport
} from 'reactflow'
import {
  addEdgeInFlow,
  addNodeToFlow,
  createNode,
  fetchEdges,
  fetchNode,
  fetchNodesInFlow,
  removeEdgeFromFlow
} from '../apis/APIs'
import {
  defaultFontSize,
  defaultNodeHeight,
  defaultNodeStyle,
  defaultNodeWidth
} from '../components/Flow/DefaultNodeStyle'
import { useFlowManager } from './FlowManager'

const windowWidth = window.screen.width

const FlowControllerContext = createContext({
  deleteComponent: () => {},
  openStyleBar: () => {},
  closeStyleBar: () => {},
  nodeChangeStyle: () => {},
  onDragOver: () => {},
  onDrop: () => {},
  onNodeEdit: () => {},
  onNodeContextMenu: () => {},
  onNodeClick: () => {},
  onNodeDoubleClick: () => {},
  onPaneContextMenu: () => {},
  onPaneClick: () => {},
  addNode: () => {},
  onConnect: () => {},
  onEdgeUpdate: () => {},
  onEditorResize: () => {},
  onNodeResize: () => {},
  onNodeDragStart: () => {},
  onNodeDragStop: () => {},
  onNodesChangeHandler: () => {},
  onEdgesChangeHandler: () => {},
  openNodeBar: () => {},
  closeNodeBar: () => {},
  startEditing: id => {},
  leaveEditing: () => {},
  leaveNodeEditing: () => {},
  updateEditor: async (id, content) => {},
  isNodeSelected: id => {},
  isEdgeSelected: id => {},
  setEditorInitContent: () => {},
  setNodeEditorContent: () => {},
  loadNodeContent: async id => {},
  nodes: [],
  edges: [],
  selectedNodes: [],
  isStyleBarOpen: false,
  isNodeBarOpen: false,
  nodeChangeStyleId: 1,
  lastSelectedNode: {},
  editorWidth: 10,
  editor: null,
  editorId: null,
  nodeEditorId: null,
  editorInitContent: 'loading',
  nodeEditorContent: 'loading',
  windowWidth: windowWidth
})

export const FlowControllerProvider = ({ children }) => {
  const { updateNodeHelper, updateEditorContent, activeFlowId } =
    useFlowManager()

  const { x, y, zoom } = useViewport()
  const xPos = useRef(50)
  const yPos = useRef(0)

  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [isStyleBarOpen, setIsStyleBarOpen] = useState(false)
  const [isNodeBarOpen, setIsNodeBarOpen] = useState(false)
  const dragNode = useRef({}) // should be position x and y

  const [nodeChangeStyleId, setNodeChangeStyleId] = useState(null)
  const [lastSelectedNode, setLastSelectedNode] = useState(null) // iNode type
  const [lastSelectedEdge, setLastSelectedEdge] = useState(null)
  const [lastRightClickedNodeId, setLastRightClickedNodeId] = useState(null)

  const [selectedNodes, setSelectedNodes] = useState([])
  const [selectedEdges, setSelectedEdges] = useState([])

  const [editorInitContent, setEditorInitContent] = useState('loading')
  const [editorId, setEditorId] = useState(null)
  const [nodeEditorId, setNodeEditorId] = useState(null)
  const [nodeEditorContent, setNodeEditorContent] = useState(undefined)
  const [editorWidth, setEditorWidth] = useState(windowWidth * 0.8) // Don't know why, it looks like 0.5

  const updateEditor = useCallback(
    async (blockContent, id) => {
      if (blockContent === undefined) return
      const editorContent = JSON.stringify(blockContent)

      let maxWidth = 0
      blockContent.forEach(block => {
        if (block.content === undefined) return
        if (
          block.content[0]?.text.length !== undefined &&
          block.content[0]?.text.length > maxWidth
        )
          maxWidth = block.content[0]?.text.length
      })

      setNodes(nds =>
        nds.map(node => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                content: editorContent
              },
              style: {
                ...node.style,
                width:
                  node.width <= defaultNodeStyle
                    ? defaultNodeStyle
                    : node.width,
                height:
                  editorContent.length <= 4 ? defaultNodeHeight : 'fit-content'
              }
            }
          } else return node
        })
      )
      console.log('update node in updateEditor.')
      updateEditorContent(id, editorContent)
      setNodeEditorContent(undefined)
    },
    [nodes, editorId, nodeEditorId]
  )

  const startEditing = useCallback(
    id => {
      // nodeEditor is open and want to open the main editor
      if (id === nodeEditorId) {
        leaveNodeEditing()
      }
      setEditorId(id)
    },
    [editorId, nodes, nodeEditorId]
  )

  const startNodeEditing = useCallback(
    id => {
      console.log('start node editing, id: ', id)
      setNodeEditorId(id)
    },
    [nodeEditorId]
  )

  useEffect(() => {
    console.log(nodeEditorContent)
  }, [nodeEditorContent])

  const leaveNodeEditing = useCallback(() => {
    console.log(
      `end node editing. nodeEditorContent:, ${nodeEditorContent}, id: ${nodeEditorId}`
    )
    if (nodeEditorId === null) return
    updateEditor(nodeEditorContent, nodeEditorId)
  }, [nodeEditorContent, nodeEditorId, updateEditor])

  const leaveEditing = useCallback(() => {
    setNodes(nds => {
      return nds.map(n => {
        if (n.id === editorId) {
          updateNodeHelper(editorId, {
            width: n.width,
            height: n.height
          })
          return {
            ...n,
            height: n.height,
            width: n.width,
            style: {
              ...n.style
            }
          }
        } else return n
      })
    })
    setEditorId(null)
    setEditorInitContent('loading')
  }, [nodes, updateNodeHelper, editorId])

  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      setSelectedNodes(nodes.map(node => node.id))
      setSelectedEdges(edges.map(edge => edge.id))
    }
  })

  const isNodeSelected = useCallback(
    id => {
      return selectedNodes.indexOf(id) !== -1
    },
    [selectedNodes]
  )
  const isEdgeSelected = useCallback(
    id => {
      return selectedEdges.indexOf(id) !== -1
    },
    [selectedEdges]
  )

  const deleteComponent = event => {
    console.log('delete component disabled')
    // removeNodeFromFlow(activeFlowId, event.target.dataset.id)
  }

  const loadNodeContent = useCallback(
    async nodeId => {
      const node = nodes.find(node => node.id === nodeId)
      const content = node.data.content
      return content
    },
    [nodes, editorId]
  )

  const onNodeResize = useCallback(
    (_, params, id) => {
      const { width, height, x, y } = params
      const node = nodes.find(node => node.id === id)
      if (!node) return

      let newFontSize = defaultFontSize
      const editorWidth = node.width
      const nodeHeight = node.height

      if (width !== defaultNodeWidth && height !== defaultNodeHeight) {
        const widthRatio = width / editorWidth
        const heightRatio = height / nodeHeight
        const scaleFactor = Math.sqrt(widthRatio * heightRatio)
        const adjustedScaleFactor = 0.4 + 0.6 * scaleFactor
        const oldFontSize = parseInt(node.style.fontSize.slice(0, -2))
        newFontSize = Math.floor(oldFontSize * adjustedScaleFactor)
      }

      const newStyle = {
        ...node.style,
        fontSize: `${newFontSize}px`
      }

      updateNodeHelper(id, {
        xpos: x,
        ypos: y,
        style: JSON.stringify(newStyle),
        width: width,
        height: height
      })

      return newFontSize
    },
    [updateNodeHelper, nodes]
  )

  const onDragOver = useCallback(event => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    event => {
      event.preventDefault()

      console.log('drop.')

      const type = event.dataTransfer.getData('application/reactflow')
      if (typeof type === 'undefined' || !type) {
        return
      }
      const position = {
        x: -x + event.clientX / zoom,
        y: -y + event.clientY / zoom
      }
      const editorId = dragNode.id
    },
    [dragNode]
  )

  const onConnect = useCallback(
    params => {
      setEdges(edges => addEdge({ id: edges.length, ...params }, edges))
      addEdgeInFlow(
        activeFlowId,
        params.source,
        params.target,
        params.sourceHandle,
        params.targetHandle
      )
    },
    [activeFlowId]
  )

  const onEdgeUpdate = useCallback(
    (prev, after) => {
      setEdges(allEdges => updateEdge(prev, after, allEdges))
      removeEdgeFromFlow(
        activeFlowId,
        prev.source,
        prev.target,
        prev.sourceHandle,
        prev.targetHandle
      ).then(() => {
        addEdgeInFlow(
          activeFlowId,
          after.source,
          after.target,
          after.sourceHandle,
          after.targetHandle
        )
      })
    },
    [activeFlowId]
  )

  const onNodeDoubleClick = useCallback(
    (event, node) => {
      startEditing(node.id)
      setLastSelectedEdge(null)
    },
    [startEditing, leaveNodeEditing]
  )

  const onNodeDragStart = useCallback(
    (event, node) => {
      dragNode.current = { x: node.position.x, y: node.position.y }
    },
    [dragNode]
  )

  const onNodeDragStop = useCallback(
    (event, node) => {
      if (
        node.position.x != dragNode.current.x ||
        node.position.y != dragNode.current.y
      ) {
        updateNodeHelper(node.id, {
          xpos: node.position.x,
          ypos: node.position.y
        })
      }
    },
    [dragNode, updateNodeHelper]
  )

  const onNodeEdit = useCallback(id => {
    startNodeEditing(id)
  }, [])

  const onNodeClick = useCallback(
    (event, node) => {
      if (node.id !== nodeEditorId) {
        leaveNodeEditing()
      }
      setLastSelectedNode(node)
      startNodeEditing(node.id)
    },
    [nodeEditorId, startNodeEditing, lastSelectedNode]
  )

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault()
      setLastRightClickedNodeId(node.id)
    },
    [lastRightClickedNodeId]
  )

  const onNodesChangeHandler = useCallback(param => {
    // 這個太及時了！如果要慢慢更新的話，使用 onNodeDragStop 會比較實惠一點
    onNodesChange(param)
    setLastSelectedEdge(null)
  }, [])

  const onEdgesChangeHandler = useCallback(params => {
    params.forEach((param, i) => {
      if (param.type === 'remove') {
        // removeEdgeFromFlow(
        //   activeFlowId,
        //   edges[param.id].source,
        //   edges[param.id].target,
        // )
      } else if (param.type === 'select') {
        setLastSelectedEdge(params[0].id)
      }
    })
    onEdgesChange(params)
  }, [])

  const onEditorResize = (event, { element, size, handle }) => {
    setEditorWidth(size.width)
  }

  const addNode = useCallback(async () => {
    yPos.current += 50
    if (yPos.current > 400) {
      yPos.current = 50
      xPos.current += 150
    }
    const nodeId = (await createNode()).id
    console.log(
      `add node to flow: node_id: ${nodeId}; flow_id: ${activeFlowId}`
    )
    addNodeToFlow(
      activeFlowId,
      nodeId,
      xPos.current,
      yPos.current,
      defaultNodeStyle
    )

    const node = {
      id: nodeId.toString(),
      data: {
        label: 'Untitle',
        content: undefined,
        toolbarPosition: Position.Right,
        width: defaultNodeWidth,
        height: defaultNodeHeight
      },
      width: defaultNodeWidth,
      height: defaultNodeHeight,
      type: 'CustomNode',
      position: { x: xPos.current, y: yPos.current },
      style: defaultNodeStyle,
      class: 'Node'
    }

    setNodes(nds => nds.concat(node))
  }, [setNodes, activeFlowId])

  const openStyleBar = id => {
    setIsStyleBarOpen(true)
    setNodeChangeStyleId(id)
  }

  const closeStyleBar = () => {
    setIsStyleBarOpen(false)
    setNodeChangeStyleId(null)
  }

  const openNodeBar = () => {
    setIsNodeBarOpen(false)
  }

  const closeNodeBar = () => {
    setIsNodeBarOpen(false)
  }

  const onPaneContextMenu = useCallback(
    event => {
      addNode()
    },
    [addNode]
  )

  const reset = useCallback(() => {
    setSelectedNodes([])
    setSelectedEdges([])
    setLastSelectedNode(null)
    setLastSelectedEdge(null)
    setLastRightClickedNodeId(null)
    setNodeChangeStyleId(null)
    setIsNodeBarOpen(false)
    setIsStyleBarOpen(false)
    leaveEditing()
    leaveNodeEditing()
    dragNode.current = {}
  }, [leaveEditing, leaveNodeEditing])

  const onPaneClick = useCallback(event => {
    reset()
  }, [])

  const nodeChangeStyle = (id, event, type) => {
    let nodeToChange = nodes.find(node => node.id === id)
    switch (type) {
      case 'background':
        nodeToChange.style = {
          ...nodeToChange.style,
          background: event.target.value
        }
        break
      case 'color':
        nodeToChange.style = {
          ...nodeToChange.style,
          borderColor: event.target.value
        }
        break
      case 'stroke':
        nodeToChange.style = {
          ...nodeToChange.style,
          borderWidth: event.target.value
        }
        break
    }

    setNodes(nds =>
      nds.map(node => {
        if (node.id === id) {
          node = nodeToChange
        }
        return node
      })
    )
    console.log('update node in nodeChangeStyle.')
    updateNodeHelper(id, {
      style: JSON.stringify(nodeToChange.style)
    })
  }

  const eventHandler = useCallback(event => {
    if (event.key === 'Delete') {
      deleteComponent(event)
    }
  }, [])

  // reload editor content from database when editorId change

  // reload nodeEditor content from database when nodeEditorId change
  // useEffect(() => {
  //   if (nodeEditorId) {
  //     if (editorId === nodeEditorId) {
  //       leaveEditing()
  //     }
  //     loadNodeContent(nodeEditorId).then(content => {
  //       setNodeEditorInitContent(content)
  //     })
  //   }
  // }, [nodeEditorId])

  // init nodes and edges
  useEffect(() => {
    if (!activeFlowId || activeFlowId < 0) return
    console.log('activeFlowId', activeFlowId)
    // reset all states
    reset()
    setNodes([])
    setEdges([])

    // init all nodes and edges
    fetchNodesInFlow(activeFlowId).then(data => {
      Promise.all(
        data.map(each =>
          fetchNode(each.node_id.toString()).then(n => {
            console.log(each)
            const nodeId = each.node_id.toString()
            const style = JSON.parse(each.style)
            const node = {
              id: nodeId,
              data: {
                label: each.label,
                content: n.content,
                toolbarPosition: Position.Right
              },
              type: 'CustomNode',
              position: { x: each.xpos, y: each.ypos },
              style: { ...style, width: each.width, height: each.height },
              width: each.width,
              height: each.height,
              class: 'Node'
            }
            return node
          })
        )
      ).then(nodes => {
        setNodes(nodes)
      })
    })

    fetchEdges(activeFlowId).then(data => {
      setEdges(
        data.map((each, index) => {
          return {
            id: index,
            source: each.source.toString(),
            target: each.target.toString(),
            sourceHandle: each.sourceHandle,
            targetHandle: each.targetHandle
          }
        })
      )
    })
  }, [activeFlowId])

  return (
    <FlowControllerContext.Provider
      value={{
        deleteComponent,
        openStyleBar,
        closeStyleBar,
        nodeChangeStyle,
        onDragOver,
        onDrop,
        onNodeClick,
        onNodeContextMenu,
        onNodeDoubleClick,
        onPaneContextMenu,
        onPaneClick,
        addNode,
        onConnect,
        onEdgeUpdate,
        onEditorResize,
        onNodeDragStart,
        onNodeDragStop,
        onNodeResize,
        onNodeEdit,
        onNodesChangeHandler,
        onEdgesChangeHandler,
        openNodeBar,
        loadNodeContent,
        closeNodeBar,
        startEditing,
        leaveEditing,
        leaveNodeEditing,
        updateEditor,
        isNodeSelected,
        isEdgeSelected,
        setNodeEditorContent,
        isNodeBarOpen,
        isStyleBarOpen,
        lastSelectedNode,
        lastRightClickedNodeId,
        selectedNodes,
        nodeChangeStyleId,
        editorWidth,
        nodes,
        edges,
        editorId,
        nodeEditorId,
        editorInitContent,
        nodeEditorContent,
        setEditorInitContent,
        windowWidth
      }}>
      {children}
    </FlowControllerContext.Provider>
  )
}

const useFlowController = () => useContext(FlowControllerContext)

export { useFlowController }
