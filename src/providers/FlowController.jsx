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
import { useFlowManager } from './FlowManager'

const FlowControllerContext = createContext({
  deleteComponent: () => {},
  openStyleBar: () => {},
  closeStyleBar: () => {},
  nodeChangeStyle: () => {},
  onDragOver: () => {},
  onDrop: () => {},
  onNodeContextMenu: () => {},
  onNodeClick: () => {},
  onNodeDoubleClick: () => {},
  onPaneClick: () => {},
  addNode: () => {},
  onConnect: () => {},
  onEdgeUpdate: () => {},
  onResize: () => {},
  onNodeResize: () => {},
  onNodeDragStart: () => {},
  onNodeDragStop: () => {},
  onNodesChangeHandler: () => {},
  onEdgesChangeHandler: () => {},
  openNodeBar: () => {},
  closeNodeBar: () => {},
  startEditing: id => {},
  leaveEditing: () => {},
  updateEditor: async (id, content) => {},
  isNodeSelected: id => {},
  isEdgeSelected: id => {},
  nodes: [],
  edges: [],
  selectedNodes: [],
  isStyleBarOpen: false,
  isNodeBarOpen: false,
  nodeChangeStyleId: 1,
  nodeEditingId: 1,
  lastSelectedNode: {},
  nodeWidth: 10,
  editor: null,
  editorContent: 'loading'
})

// https://reactflow.dev/api-reference/types/node
const defaultNodeStyle = {
  boxSizing: 'border-box',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: 'black',
  background: 'white',
  borderRadius: 10,
  padding: '2px',
  fontSize: '12px',
  minWidth: '50px',
  minHeight: '50px',
  overflow: 'hidden'
}

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

  const [nodeEditingId, setNodeEditingId] = useState(null)
  const [nodeChangeStyleId, setNodeChangeStyleId] = useState(null)
  const [lastSelectedNode, setLastSelectedNode] = useState(null) // iNode type
  const [lastSelectedEdge, setLastSelectedEdge] = useState(null)
  const [lastRightClickedNodeId, setLastRightClickedNodeId] = useState(null)
  const [nodeWidth, setNodeWidth] = useState(window.innerWidth * 0.4)

  const [selectedNodes, setSelectedNodes] = useState([])
  const [selectedEdges, setSelectedEdges] = useState([])
  const [editorContent, setEditorContent] = useState('loading')

  // editor

  const editor = useMemo(() => {
    if (editorContent === 'loading') {
      return undefined
    }
    return BlockNoteEditor.create()
  }, [editorContent, nodeEditingId])

  const updateEditor = useCallback(
    async (editorId, htmlContent) => {
      if (editorId !== nodeEditingId || !editor) return

      setNodes(nds =>
        nds.map(node => {
          if (node.id === nodeEditingId) {
            return {
              ...node,
              data: {
                ...node.data,
                content: htmlContent
              }
            }
          } else return node
        })
      )
      updateEditorContent(nodeEditingId, htmlContent)
    },
    [editorContent, editor]
  )

  useEffect(() => {
    if (!nodeEditingId) return
    loadNodeContent(nodeEditingId).then(content => {
      setEditorContent(content)
    })
  }, [nodeEditingId])

  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      setSelectedNodes(nodes.map(node => node.id))
      setSelectedEdges(edges.map(edge => edge.id))
    }
  })

  const isNodeSelected = useCallback(
    id => {
      // console.log(id, 'selected?', selectedNodes.indexOf(id) !== -1)
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
    [nodes, nodeEditingId]
  )

  const onNodeResize = useCallback(
    (_, params, id) => {
      const { width, height, x, y } = params
      const node = nodes.find(node => node.id === id)
      if (!node) return

      const nodeWidth = node.width
      const nodeHeight = node.height
      const widthRatio = width / nodeWidth
      const heightRatio = height / nodeHeight

      const scaleFactor = 1 + Math.log2(Math.sqrt(widthRatio * heightRatio)) / 5
      const oldFontSize = parseInt(node.style.fontSize.slice(0, -2))
      const newFontSize = Math.ceil(oldFontSize * scaleFactor)

      const newStyle = {
        ...node.style,
        fontSize: `${newFontSize}px`
      }

      setNodes(nds =>
        nds.map(n => {
          if (n.id === id) {
            n.xpos = x
            n.ypos = y
            n.style = newStyle
            n.data = {
              ...n.data,
              width: width,
              height: height
            }
          }
          return n
        })
      )

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

  const onNodeDoubleClick = useCallback((event, node) => {
    startEditing(node.id)
    setNodes(nds => {
      return nds.map(n =>
        n.id === node.id
          ? {
              ...n,
              style: {
                ...n.style,
                // height: 'fit-content',
                width: 'fit-content'
              }
            }
          : n
      )
    })
    setLastSelectedEdge(null)
  }, [])

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
        console.log(node.position.x)
        updateNodeHelper(node.id, {
          xpos: node.position.x,
          ypos: node.position.y
        })
      }
      console.log('drag stop.')
    },
    [dragNode, updateNodeHelper]
  )

  const onNodeClick = useCallback((event, node) => {
    console.log('click on node.')
    setLastSelectedNode(node)
  }, [])

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault()
    console.log('right click on node.')
    setLastRightClickedNodeId(node.id)
  }, [])

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

  const onResize = (event, { element, size, handle }) => {
    setNodeWidth(size.width)
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
        content: '',
        toolbarPosition: Position.Right,
        width: 50,
        height: 50
      },
      type: 'CustomNode',
      position: { x: xPos.current, y: yPos.current },
      style: defaultNodeStyle,
      class: 'Node'
    }

    setNodes(data => data.concat(node))
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

  const startEditing = useCallback(
    id => {
      setNodeEditingId(id)
    },
    [nodeEditingId]
  )

  const leaveEditing = useCallback(() => {
    const currentNode = nodes.find(n => n.id === nodeEditingId)
    if (!currentNode) return

    updateNodeHelper(nodeEditingId, {
      width: currentNode.width,
      height: currentNode.height
    })
    setNodeEditingId(null)
  }, [nodes])

  const onPaneClick = useCallback(
    (event, node) => {
      setLastSelectedNode(null)
      setLastSelectedEdge(null)
      setLastRightClickedNodeId(null)
      leaveEditing()
    },
    [leaveEditing]
  )

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

  useEffect(() => {
    if (lastSelectedNode?.id !== nodeEditingId) {
      document.addEventListener('keydown', eventHandler)
      return () => document.removeEventListener('keydown', eventHandler)
    }
  }, [lastSelectedNode, lastSelectedEdge, nodeEditingId])

  useEffect(() => {
    if (nodeEditingId) {
      setIsNodeBarOpen(false)
      setIsStyleBarOpen(false)
    }
  }, [nodeEditingId])

  // init nodes and edges
  useEffect(() => {
    if (!activeFlowId || activeFlowId < 0) return
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
        onPaneClick,
        addNode,
        onConnect,
        onEdgeUpdate,
        onResize,
        onNodeDragStart,
        onNodeDragStop,
        onNodeResize,
        onNodesChangeHandler,
        onEdgesChangeHandler,
        openNodeBar,
        closeNodeBar,
        startEditing,
        leaveEditing,
        updateEditor,
        isNodeSelected,
        isEdgeSelected,
        isNodeBarOpen,
        isStyleBarOpen,
        lastSelectedNode,
        lastRightClickedNodeId,
        selectedNodes,
        nodeChangeStyleId,
        nodeEditingId,
        editorContent,
        nodeWidth,
        nodes,
        edges,
        editor
      }}>
      {children}
    </FlowControllerContext.Provider>
  )
}

const useFlowController = () => useContext(FlowControllerContext)

export { useFlowController }
