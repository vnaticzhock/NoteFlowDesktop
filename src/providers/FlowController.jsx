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
  removeNodeFromFlow,
  editNodeTitle
} from '../apis/APIs'
import {
  defaultFontSize,
  defaultNodeHeight,
  defaultNodeStyle,
  defaultNodeWidth
} from '../components/Flow/DefaultNodeStyle'
import { PartialBlock } from '@blocknote/core'
import { useFlowManager } from './FlowManager'
import {
  startYjs,
  updateComponent as updateToYjs,
  addComponent as addToYjs,
  deleteComponent as deleteFromYjs,
  YjsCallbackUpdater,
  YJS
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
  updateEditorInFlow: async (id, content) => {},
  isNodeSelected: id => {},
  isEdgeSelected: id => {},
  setEditorInitContent: () => {},
  loadNodeContent: async id => {},
  onNodeDrag: () => {},
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

  const updateEditorInFlow = useCallback(
    async (id, blockContent) => {
      if (blockContent === undefined) return

      const title = blockContent[0].content[0]?.text
      if (title !== '' || title !== undefined || title !== null) {
        editNodeTitle(id, title)
        setNodes(nds =>
          nds.map(n => {
            if (n.id === id) {
              n = {
                ...n,
                title: title
              }
            }
            return n
          })
        )
      }

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
    [nodes]
  )

  const startEditing = useCallback(
    id => {
      leaveNodeEditing()
      setEditorId(id)
    },
    [editorId, nodes, nodeEditorId]
  )

  const loadNodeContent = useCallback(
    async nodeId => {
      const node = nodes.find(node => node.id === nodeId)
      const content = node.data.content
      return content
    },
    [nodes, editorId]
  )

  useEffect(() => {
    if (editorId) {
      loadNodeContent(editorId).then(content => {
        if (content !== undefined && content !== '') {
          setEditorInitContent(JSON.parse(content))
        } else {
          setEditorInitContent(undefined)
        }
      })
    }
  }, [editorId])

  const startNodeEditing = useCallback(
    id => {
      console.log('start node Editing')
      setNodeEditorId(prev => {
        if (prev !== null) {
          updateEditorInFlow(prev, nodeEditorContent[prev])
        }
        return id
      })
    },
    [nodeEditorId, nodeEditorContent]
  )

  const leaveNodeEditing = useCallback(() => {
    console.log('leave node Editing')
    setNodeEditorId(prev => {
      console.log('prev', prev)
      console.log(nodeEditorContent[prev])
      if (prev !== null) {
        updateEditorInFlow(prev, nodeEditorContent[prev])
      }
      return null
    })
  }, [nodeEditorId, nodeEditorContent])

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

      // if (YJS) {

      // }

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

      const EdgeId = requestFromYjs
        ? params.id
        : edges.length == 0
          ? '0'
          : (Math.max(...edges.map(each => parseInt(each.id))) + 1).toString()

      const newEdge = { id: EdgeId, ...params }
      setEdges(edges => addEdge(newEdge, edges))

      // TODO: edge 整頓

      // yjs
      if (YJS && !requestFromYjs) {
        addToYjs('edges', EdgeId, newEdge)

        console.log(params, EdgeId)

        void addEdgeInFlow(
          activeFlowId,
          EdgeId,
          params.source,
          params.target,
          params.sourceHandle,
          params.targetHandle,
          ''
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

      if (YJS) {
        updateToYjs('edges', prev.id, after)
      }
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

  const onNodeDrag = useCallback((event, node) => {
    if (YJS) {
      updateToYjs('nodes', node.id, node)
    }
  }, [])

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

  const onNodesChangeHandler = useCallback(
    params => {
      params.forEach((param, i) => {
        if (param.type === 'remove') {
          void removeNodeFromFlow(activeFlowId, param.id)

          if (YJS) {
            deleteFromYjs('nodes', param.id)
          }
        }
      })
      onNodesChange(params)
      setLastSelectedEdge(null)
    },
    [activeFlowId]
  )

  const onEdgesChangeHandler = useCallback(
    params => {
      params.forEach((param, i) => {
        if (param.type === 'remove') {
          void removeEdgeFromFlow(activeFlowId, param.id)

          if (YJS) {
            deleteFromYjs('edges', param.id)
          }
        } else if (param.type === 'select') {
          setLastSelectedEdge(params[0].id)
        }
      })
      onEdgesChange(params)
    },
    [activeFlowId, edges]
  )

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
    void addNodeToFlow(
      activeFlowId,
      nodeId,
      xPos.current,
      yPos.current,
      defaultNodeStyle
    )

    const node = {
      id: nodeId.toString(),
      data: {
        title: 'Untitle',
        content: undefined,
        toolbarPosition: Position.Right
      },
      type: 'CustomNode',
      position: { x: xPos.current, y: yPos.current },
      style: defaultNodeStyle,
      class: 'Node'
    }

    setNodes(nds => nds.concat(node))

    // yjs
    if (YJS) {
      addToYjs('nodes', node.id, node)
    }
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
    dragNode.current = {}
  }, [leaveEditing, leaveNodeEditing])

  const onPaneClick = useCallback(
    event => {
      reset()
    },
    [reset]
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
          id: each.id,
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
                title: each.title,
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
        startYjs(activeFlowId, {
          nodes: new_nodes,
          edges: new_edges
        })
      })
    })
  }, [activeFlowId])

  const onYjsUpdate = useCallback(
    (type, payload) => {
      const id = payload.id
      const isDelete = payload.content === undefined
      if (isDelete) {
        if (type === 'edges') {
          // 完全沒有同步，十分糟糕。
          setEdges(nds => {
            console.log(nds, id)
            return nds.filter(edge => {
              return edge.id !== id
            })
          })
        } else {
          setNodes(nds => {
            return nds.filter(node => {
              return node.id !== id
            })
          })
        }
        return
      }

      const searched = type === 'edges' ? edges : nodes
      const payloadIdx = searched.findIndex(each => {
        return each.id === id
      })
      if (payloadIdx === -1) {
        // add node or edge
        if (type === 'edges') {
          // TEST: OK
          onConnect(payload.content)
        } else {
          // ref: addNode
          // TEST: OK
          setNodes(nds => nds.concat(payload.content))
        }
        return
      }

      // update
      if (type === 'edges') {
        setEdges(allEdges =>
          // TEST: seems OK
          updateEdge(edges[payloadIdx], payload.content, allEdges)
        )
      } else {
        // dragging & resizing
        // TEST: OK, but 好像 nodes 會黏在一起，會拖曳著移動
        // 而且相對位置間有些怪怪的，我在想或許是 viewport 的倍數
        setNodes(nds =>
          nds.map(node => {
            if (node.id === id) {
              return payload.content
            } else return node
          })
        )
      }
    },
    [edges, nodes]
  )

  useEffect(() => {
    YjsCallbackUpdater(onYjsUpdate)
  }, [onYjsUpdate])

  return (
    <FlowControllerContext.Provider
      value={{
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
        onNodesChangeHandler,
        onNodeDrag,
        onEdgesChangeHandler,
        openNodeBar,
        loadNodeContent,
        closeNodeBar,
        startNodeEditing,
        startEditing,
        leaveEditing,
        leaveNodeEditing,
        updateEditorInFlow,
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
