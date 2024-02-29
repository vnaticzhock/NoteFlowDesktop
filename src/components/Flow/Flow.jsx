import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  forwardRef,
} from 'react'
import ReactFlow, {
  Position,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  updateEdge,
  useReactFlow,
  useViewport,
} from 'reactflow'
import CustomNode from './Node'
import ToolBar from './ToolBar'
import StyleBar from './StyleBar'
import NodeBar from './NodeBar'

import { Navigate } from 'react-router-dom'
import { Resizable } from 'react-resizable'
import 'react-resizable/css/styles.css'

import './Flow.scss'
import 'reactflow/dist/style.css'
import { useNavigate } from 'react-router-dom'
import Node from '../Node/Node'
import { createNode, addNodeToFlow, fetchNodesInFlow } from '../../apis/APIs'
import {
  FlowManagementProvider,
  useFlowManager,
} from '../../providers/FlowManager'

const nodeTypes = {
  CustomNode,
}

const defaultNodeStyle = {
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: 'black',
  background: 'white',
  borderRadius: 10,
  height: 50,
  width: 150,
}

const Flow = () => {
  // const rfInstance = useReactFlow()

  const { flowId, needUpdatedHandler } = useFlowManager()
  const xPos = useRef(50)
  const yPos = useRef(0)
  const nodeId = useRef(0)
  const edgeId = useRef(0)
  const subRef = useRef(null)
  const miniRef = useRef()

  const [bgVariant, setBgVariant] = useState('line')
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [title, setTitle] = useState('')
  const [isStyleBarOpen, setIsStyleBarOpen] = useState(false)
  const [back, setBack] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [nodeWidth, setNodeWidth] = useState(window.innerWidth * 0.4)
  // const { flowWebSocket, renewFlowWebSocket, renameTab } = usePageTab()
  const [isNodeBarOpen, setIsNodeBarOpen] = useState(false)
  const [dragNode, setDragNode] = useState({})
  const [changeLabelId, setChangeLabelId] = useState({ id: null, label: null })
  const [changeStyleId, setChangeStyleId] = useState(null)
  const [changeStyleContent, setChangeStyleContent] = useState(null)
  const [nodeEditingId, setNodeEditingid] = useState(null)

  // const { nodeMenuOpen, setNodeMenuOpen } = useParams()

  // for node remove
  const [lastSelectedNode, setLastSelectedNode] = useState(null)
  const [lastSelectedEdge, setLastSelectedEdge] = useState(null)

  const navigateTo = useNavigate()
  const deleteComponent = (event) => {}

  const openNodeContextMenu = () => {}

  const onLabelChange = (id, event) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id == id) {
          node.data = {
            ...node.data,
            label: event.target.value,
          }
        }
        return node
      }),
    )
  }

  const openStyleBar = (id) => {
    setIsStyleBarOpen(true)
    setChangeStyleId(id)
  }

  const handleStyleBarClose = () => {
    setIsStyleBarOpen(false)
    setChangeStyleId(null)
    setChangeStyleContent(null)
  }

  const nodeChangeStyle = (id, event, type) => {
    // setChangeStyleId(id);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id == id) {
          switch (type) {
            case 'background':
              node.style = {
                ...node.style,
                background: event.target.value,
              }
              setChangeStyleContent(node.style)
              break
            case 'color':
              node.style = {
                ...node.style,
                borderColor: event.target.value,
              }
              setChangeStyleContent(node.style)
              break
            case 'stroke':
              node.style = {
                ...node.style,
                borderWidth: event.target.value,
              }
              setChangeStyleContent(node.style)
              break
          }
        }
        return node
      }),
    )
  }
  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    console.log('drag over.')
  }, [])

  let { x, y, zoom } = useViewport()

  const onDrop = useCallback((event) => {
    event.preventDefault()

    console.log('drop.')

    const type = event.dataTransfer.getData('application/reactflow')
    if (typeof type === 'undefined' || !type) {
      return
    }
    // ? 要從 event.clientX cast 到 react flow 的 x, y
    const position = {
      x: -x + event.clientX / zoom,
      y: -y + event.clientY / zoom,
    }
    // console.log('dragged:', dragNode);
    const editorId = dragNode.id
  })

  const onResize = (event, { element, size, handle }) => {
    setNodeWidth(size.width)
  }

  useEffect(() => {
    if (lastSelectedNode != nodeEditingId) {
      document.addEventListener('keydown', deleteComponent)
      return () => document.removeEventListener('keydown', deleteComponent)
    }
  }, [lastSelectedNode, lastSelectedEdge, nodeEditingId])

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges],
  )
  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) =>
      setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    [],
  )

  const addNode = useCallback(async () => {
    yPos.current += 50
    if (yPos.current > 400) {
      yPos.current = 50
      xPos.current += 150
    }
    const nodeId = (await createNode()).id
    console.log(`add note to flow: node_id: ${nodeId}; flow_id: ${flowId}`)
    addNodeToFlow(flowId, nodeId, xPos.current, yPos.current, defaultNodeStyle)

    const node = {
      id: nodeId.toString(),
      data: {
        label: 'Untitle',
        toolbarPosition: Position.Right,
        openStyleBar: (id) => {
          openStyleBar(id)
        },
        onLabelChange: (id, event) => {
          onLabelChange(id, event)
        },
        editLabel: (id, label) => {
          setChangeLabelId({ id, label })
        },
        onLabelEdit: (id) => {
          setNodeEditingid(id)
        },
        onLabelStopEdit: () => {
          setNodeEditingid(null)
        },
      },
      type: 'CustomNode',
      position: { x: xPos.current, y: yPos.current },
      style: defaultNodeStyle,
      class: 'Node',
    }

    setNodes((data) => data.concat(node))
    // pasteNodeToFlow(id, xPos, yPos)
  }, [setNodes, flowId])

  const handleNodeBarOpen = () => {
    setIsNodeBarOpen((state) => !state)
  }
  const handleNodeBarClose = () => {
    setIsNodeBarOpen((state) => !state)
  }

  const backToHome = () => {
    setBack(true)
  }

  const onNodeDoubleClick = useCallback((event, node) => {
    //open editor by nodeID
    zoom = 2
    // setEditorId(node.id)
    // setLastSelectedNode(node.id);
    setNodeEditingid(node.id)
    setLastSelectedEdge(null)
    setIsEdit(true)
  })

  const onNodeClick = useCallback((event, node) => {
    console.log('click on node.')
    setLastSelectedNode(node.id)
  })

  const onPaneClick = useCallback((event, node) => {
    console.log('pane click.')
    setLastSelectedNode(null)
    // setNodeMenuOpen(null)
  })

  const canvasRef = useRef()

  useEffect(() => {
    if (isEdit) {
      setIsNodeBarOpen(false)
      setIsStyleBarOpen(false)
    }
  }, [isEdit])

  useEffect(() => {
    if (!flowId) return
    fetchNodesInFlow(flowId).then((data) => {
      setNodes(
        data.map((each) => {
          const nodeId = each.node_id.toString()
          const style = JSON.parse(each.style)
          const node = {
            id: nodeId,
            data: {
              label: 'Untitle',
              toolbarPosition: Position.Right,
              openStyleBar: (id) => {
                openStyleBar(id)
              },
              onLabelChange: (id, event) => {
                onLabelChange(id, event)
              },
              editLabel: (id, label) => {
                setChangeLabelId({ id, label })
              },
              onLabelEdit: (id) => {
                setNodeEditingid(id)
              },
              onLabelStopEdit: () => {
                setNodeEditingid(null)
              },
            },
            type: 'CustomNode',
            position: { x: each.xpos, y: each.ypos },
            style: style,
            class: 'Node',
          }

          return node
        }),
      )
    })
  }, [flowId])

  return (
    <div
      className="FlowEditPanel"
      // onMouseMove={handleMouseMove}
      ref={canvasRef}
    >
      {!back ? (
        <ReactFlow
          className="NodePanel"
          fitView={true}
          nodes={nodes}
          edges={edges}
          onDrop={onDrop}
          onNodeDragStart={(event, node) => {}}
          onNodeDragStop={(event, node) => {
            needUpdatedHandler('nodes', node.id, {
              xpos: node.position.x,
              ypos: node.position.y,
            })
          }}
          onDragOver={onDragOver}
          onPaneClick={(event) => onPaneClick(event)}
          onNodesChange={(param) => {
            // 這個太及時了！如果要慢慢更新的話，使用 onNodeDragStop 會比較實惠一點
            // console.log('change..')
            onNodesChange(param)
            setLastSelectedEdge(null)
            // setLastSelectedNode(param[0].id);
            // flowWebSocket.editComponent(param, 'node')
          }}
          onEdgesChange={(param) => {
            setLastSelectedNode(null)
            setLastSelectedEdge(param[0].id)
            onEdgesChange(param)
            // flowWebSocket.editComponent(param, 'edge')
          }}
          onEdgeUpdate={(param) => {
            onEdgeUpdate(param)
          }}
          onConnect={(param) => {
            onConnect(param)
            // flowWebSocket.addComponent(
            //   { ...param, id: edgeId.current.toString() },
            //   'edge',
            // )
          }}
          // snapToGrid={true} // node 移動的單位要跟 grid 一樣的關鍵！
          onNodeDoubleClick={(event, node) => {
            onNodeDoubleClick(event, node)
          }}
          onNodeClick={(event, node) => {
            onNodeClick(event, node)
          }}
          nodeTypes={nodeTypes}
          // edgeTypes={edgeTypes}
        >
          {isStyleBarOpen && !isEdit ? (
            <StyleBar
              handleStyleBarClose={handleStyleBarClose}
              nodes={nodes}
              nodeId={changeStyleId}
              nodeChangeStyle={(id, event, type) =>
                nodeChangeStyle(id, event, type)
              }
            />
          ) : null}
          {isNodeBarOpen && !isEdit ? (
            <NodeBar
              handleNodeBarClose={handleNodeBarClose}
              setDragNode={setDragNode}
            />
          ) : null}
          <ToolBar
            setTitle={setTitle}
            title={title}
            addNode={addNode}
            backToHome={backToHome}
            handleNodeBarOpen={handleNodeBarOpen}
            changeBackground={(bgStyle) => {
              setBgVariant(bgStyle)
            }}
            isNodeSelected={lastSelectedNode}
            // flowWebSocket={flowWebSocket}
            openNodeContextMenu={openNodeContextMenu}
            flowId={flowId}
            subRef={subRef}
            isEdit={isEdit}
          />
          {/* {isStyleBarOpen ? <StyleBar isOpen={isStyleBarOpen} /> : null} */}
          <MiniMap ref={miniRef} nodeStrokeWidth={10} zoomable pannable />
          <Controls />
          <Background color="#ccc" variant={bgVariant} />
        </ReactFlow>
      ) : (
        <Navigate to="/" />
      )}
      {isEdit && (
        // <div className="EditorContainer">
        <Resizable
          // className="box"
          height={Infinity}
          width={nodeWidth}
          // width="400px"
          onResize={onResize}
          resizeHandles={['w']}
          minConstraints={[window.innerWidth * 0.37, Infinity]}
          maxConstraints={[window.innerWidth * 0.7, Infinity]}
        >
          <div
          // style={{ width: `${nodeWidth}px` }}
          >
            <Node
              nodeId={nodeEditingId}
              setNodeIsEditing={setNodeEditingid}
              setIsEdit={setIsEdit}
              nodeWidth={nodeWidth}
            />
          </div>
        </Resizable>
      )}
    </div>
  )
}

const FlowProvider = () => {
  return (
    <div className="Flow-container">
      <ReactFlowProvider>
        <FlowManagementProvider>
          <Flow />
        </FlowManagementProvider>
      </ReactFlowProvider>
    </div>
  )
}

export default FlowProvider
