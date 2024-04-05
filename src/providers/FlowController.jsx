import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  removeEdgeFromFlow,
  removeNodeFromFlow
} from '../apis/APIs'
import {
  defaultFontSize,
  defaultNodeHeight,
  defaultNodeStyle,
  defaultNodeWidth
} from '../components/Flow/DefaultNodeStyle'
import { useFlowManager } from './FlowManager'
import {
  startYjs,
  updateComponent as updateToYjs,
  addComponent as addToYjs
} from '../apis/Yjs'

const windowWidth = window.screen.width

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
  nodeEditorContent: {},
  windowWidth: windowWidth
})

let nodeEditorContent = {}

export const FlowControllerProvider = ({ children }) => {
  const { updateNodeHelper, updateEditorContent, activeFlowId } =
    useFlowManager()

  let { x, y, zoom } = useViewport()

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
  const [editorWidth, setEditorWidth] = useState(windowWidth * 0.8) // Don't know why, it looks like 0.5

  const updateEditor = useCallback(
    async (blockContent, id) => {
      if (blockContent === undefined) return
      const editorContent = JSON.stringify(blockContent)

      // resize the node according to the content
      setNodes(nds =>
        nds.map(node => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                content: editorContent,
                width: node.width,
                height: node.height
              }
            }
          } else return node
        })
      )
      updateEditorContent(id, editorContent)
    },
    [nodes, editorId, nodeEditorId]
  )

  const startEditing = useCallback(
    id => {
      leaveNodeEditing()
      setEditorId(id)
    },
    [editorId, nodes, nodeEditorId]
  )

  const startNodeEditing = useCallback(
    id => {
      setNodeEditorId(prev => {
        if (prev !== null) {
          updateEditor(nodeEditorContent[prev], prev)
        }
        return id
      })
    },
    [nodeEditorId]
  )

  const leaveNodeEditing = useCallback(() => {
    setNodeEditorId(prev => {
      if (prev !== null) {
        updateEditor(nodeEditorContent[prev], prev)
      }
      return null
    })
  }, [nodeEditorId])

  const leaveEditing = useCallback(() => {
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

  const onNodesDelete = nodes => {
    for (const node of nodes) {
      removeNodeFromFlow(activeFlowId, node.id)
    }
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
      if (!node || width < defaultNodeWidth || height < defaultNodeHeight)
        return

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
      const requestFromYjs = Object.keys(params).includes('id')

      const EdgeId = requestFromYjs ? params.id : edges.length.toString()

      const newEdge = { id: EdgeId, ...params }
      setEdges(edges => addEdge(newEdge, edges))

      // yjs
      if (!requestFromYjs) {
        addToYjs('edges', EdgeId, newEdge)

        void addEdgeInFlow(
          activeFlowId,
          params.source,
          params.target,
          params.sourceHandle,
          params.targetHandle
        )
      }
    },
    [activeFlowId, edges]
  )

  const onEdgeUpdate = useCallback(
    (prev, after) => {
      setEdges(allEdges => updateEdge(prev, after, allEdges))
      void removeEdgeFromFlow(
        activeFlowId,
        prev.source,
        prev.target,
        prev.sourceHandle,
        prev.targetHandle
      ).then(() => {
        void addEdgeInFlow(
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
    [startEditing]
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

  const onNodeClick = useCallback(
    (event, node) => {
      setLastSelectedNode(node)
    },
    [lastSelectedNode]
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
        toolbarPosition: Position.Right
      },
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
    setIsNodeBarOpen(prev => !prev)
  }

  const closeNodeBar = () => {
    setIsNodeBarOpen(false)
  }

  const onPaneContextMenu = useCallback(
    event => {
      addNode()
      leaveNodeEditing()
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
    nodeEditorContent = {}
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

    updateNodeHelper(id, {
      style: JSON.stringify(nodeToChange.style)
    })
  }

  // const eventHandler = useCallback(event => {
  //   if (event.key === 'Delete') {
  //     deleteComponent(event)
  //   }
  // }, [])

  // init nodes and edges
  useEffect(() => {
    if (!activeFlowId || activeFlowId < 0) return
    // reset all states
    reset()
    setNodes([])
    setEdges([])

    // init all nodes and edges
    // after that, init yjs.
    const nodePromise = fetchNodesInFlow(activeFlowId)
    const edgePromise = fetchEdges(activeFlowId)

    void Promise.all([nodePromise, edgePromise]).then(values => {
      const new_edges = values[1].map((each, index) => {
        return {
          id: index,
          source: each.source.toString(),
          target: each.target.toString(),
          sourceHandle: each.sourceHandle,
          targetHandle: each.targetHandle
        }
      })

      void Promise.all(
        values[0].map(each =>
          fetchNode(each.node_id.toString()).then(n => {
            const nodeId = each.node_id.toString()
            // const style = JSON.parse(each.style)
            const node = {
              id: nodeId,
              data: {
                label: each.label,
                content: n.content,
                toolbarPosition: Position.Right
              },
              type: 'CustomNode',
              position: { x: each.xpos, y: each.ypos },
              style: JSON.parse(each.style),
              width: each.width,
              height: each.height,
              class: 'Node'
            }
            return node
          })
        )
      ).then(new_nodes => {
        setNodes(new_nodes)
        setEdges(new_edges)
        startYjs('yugo43', {
          nodes: new_nodes,
          edges: new_edges,
          onUpdate: (type, payload) => {
            // TODO: 慘了，onUpdate 寫在初始化的腳本裡面，他又會拿會持續更新的 edges 在 dependency 裡面，所以 edges 目前都是舊的
            switch (type) {
              case 'edges':
                const id = payload.id
                const isDelete = !Object.keys(payload).includes('content')
                console.log(isDelete)
                if (isDelete) {
                  return
                }
                const payloadIdx = edges.findIndex(each => {
                  return each.id === id
                })
                if (payloadIdx === -1) {
                  onConnect(payload.content)
                  return
                }
                onEdgeUpdate(edges[payloadIdx], payload.content)
                break
              case 'nodes':
                break
            }
          }
        })
      })
    })
  }, [activeFlowId])

  return (
    <FlowControllerContext.Provider
      value={{
        openStyleBar,
        closeStyleBar,
        nodeChangeStyle,
        onDragOver,
        onDrop,
        onNodeClick,
        onNodesDelete,
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
        onNodesChangeHandler,
        onEdgesChangeHandler,
        openNodeBar,
        loadNodeContent,
        closeNodeBar,
        startNodeEditing,
        startEditing,
        leaveEditing,
        leaveNodeEditing,
        updateEditor,
        isNodeSelected,
        isEdgeSelected,
        setEditorInitContent,
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
        windowWidth
      }}>
      {children}
    </FlowControllerContext.Provider>
  )
}

const useFlowController = () => useContext(FlowControllerContext)

export { useFlowController }
