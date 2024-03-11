import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  updateEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useViewport,
} from 'reactflow'
import CustomNode from './Node'
import NodeBar from './NodeBar'
import StyleBar from './StyleBar'
import ToolBar from './ToolBar'

import { Resizable } from 'react-resizable'
import 'react-resizable/css/styles.css'
import { Navigate, useLocation } from 'react-router-dom'

// import instance from '../../API/api'
// import { useApp } from '../../hooks/useApp'
import 'reactflow/dist/style.css'
import './Flow.scss'
// import FlowWebSocket, { convert } from '../../hooks/flowConnection'
import { useNavigate } from 'react-router-dom'
import Node from '../Node/Node'

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

function Flow() {
  const rfInstance = useReactFlow()

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
  const [editorId, setEditorId] = useState(null)
  // const { flowWebSocket, renewFlowWebSocket, renameTab } = usePageTab()
  const [isNodeBarOpen, setIsNodeBarOpen] = useState(false)
  const [dragNode, setDragNode] = useState({})
  const [changeLabelId, setChangeLabelId] = useState({ id: null, label: null })
  const [changeStyleId, setChangeStyleId] = useState(null)
  const [changeStyleContent, setChangeStyleContent] = useState(null)
  const [nodeIsEditing, setNodeIsEditing] = useState(null)
  // const { nodeMenuOpen, setNodeMenuOpen } = useParams()

  // for node remove
  const [lastSelectedNode, setLastSelectedNode] = useState(null)
  const [lastSelectedEdge, setLastSelectedEdge] = useState(null)
  const searchParams = new URLSearchParams(location.search)
  // const { user } = useApp()
  const flowId = searchParams.get('id')

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
  }, [])

  let { x, y, zoom } = useViewport()

  console.log('anchor', x, y)

  const onDrop = useCallback((event) => {
    event.preventDefault()

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

  const rerenderNodes = (nodes) => {
    nodes.map((node) => {
      node.data = {
        ...node.data,
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
          setNodeIsEditing(id)
        },
        onLabelStopEdit: () => {
          setNodeIsEditing(null)
        },
      }
      return node
    })
    setNodes(nodes)
  }

  const trackerCallback = useCallback(
    async (tracker, record) => {
      // [1234-gmail_com: {email: ..., name: ..., x: ..., y: ...}]
      // 創一個 child element
      if (!subRef.current) return

      Object.keys(tracker).forEach((email, index) => {
        if (!(email in record)) {
          record[email] = true
          // FlowWebSocket.createInstance(email, 'sub-flow').then((instance) => {
          //   const oldInstance = document.getElementById(`sub-flow-${email}`)
          //   if (oldInstance) {
          //     subRef.current.removeChild(oldInstance)
          //   }
          //   instance.onclick = (e) => {
          //     const { xPort, yPort } = tracker[email]

          //     rfInstance.setViewport({ x: -xPort, y: -yPort, zoom: 1 })
          //   }
          //   subRef.current.appendChild(instance)
          // })
        } else {
          // 有沒有在閒置
          const instance = document.querySelector(`#sub-flow-${email}`)

          // if (record.email.exit) {
          //   instance.classList.add('exited');
          // } else {
          //   instance.classList.remove('exited');
          // }

          if (instance) {
            if (Date.now() - tracker[email].lastUpdate >= 8000) {
              instance.style.display = 'none'
            } else {
              instance.style.opacity = 1
            }
          }
        }
      })
    },
    [subRef, rfInstance],
  )

  useEffect(() => {
    if (lastSelectedNode != nodeIsEditing) {
      document.addEventListener('keydown', deleteComponent)
      return () => document.removeEventListener('keydown', deleteComponent)
    }
  }, [lastSelectedNode, lastSelectedEdge, nodeIsEditing])

  const rerender = (data) => {
    // setNodes(data.nodes);
    rerenderNodes(data.nodes)
    setEdges(data.edges)
    setTitle(data.name)
    const node_ids = new Array(data.nodes.length)
    data.nodes.forEach((element, index) => {
      node_ids[index] = Number(element.id)
    })

    const edge_ids = new Array(data.edges.length)
    data.edges.forEach((element, index) => {
      edge_ids[index] = Number(element.id)
    })
    nodeId.current = data.nodes.length === 0 ? 0 : Math.max(...node_ids) + 1
    edgeId.current = data.edges.length === 0 ? 0 : Math.max(...edge_ids) + 1
  }

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

  // const onNodesDelete = useCallback(
  //   (deleted) => {
  //     setEdges(
  //       deleted.reduce((acc, node) => {
  //         const incomers = getIncomers(node, nodes, edges);
  //         const outgoers = getOutgoers(node, nodes, edges);
  //         const connectedEdges = getConnectedEdges([node], edges);
  //         const remainingEdges = acc.filter(
  //           (edge) => !connectedEdges.includes(edge),
  //         );
  //         const createdEdges = incomers.flatMap(({ id: source }) =>
  //           outgoers.map(({ id: target }) => ({
  //             id: `${source}->${target}`,
  //             source,
  //             target,
  //           })),
  //         );
  //         return [...remainingEdges, ...createdEdges];
  //       }, edges),
  //     );
  //   },
  //   [nodes, edges],
  // );

  const onAdd = useCallback(() => {
    yPos.current += 50
    if (yPos.current > 400) {
      yPos.current = 50
      xPos.current += 150
    }
  }, [setNodes])

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
    setEditorId(node.editorId)
    // setLastSelectedNode(node.id);
    setNodeIsEditing(node.id)
    setLastSelectedEdge(null)
    setIsEdit(true)
  })

  const onNodeClick = useCallback((event, node) => {
    setLastSelectedNode(node.id)
  })

  const onPaneClick = useCallback((event, node) => {
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
          onDragOver={onDragOver}
          onPaneClick={(event) => onPaneClick(event)}
          onNodesChange={(param) => {
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
          snapToGrid={true}
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
            addNode={onAdd}
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
              nodeId={editorId}
              setNodeIsEditing={setNodeIsEditing}
              setIsEdit={setIsEdit}
              nodeWidth={nodeWidth}
            />
          </div>
        </Resizable>
      )}
    </div>
  )
}

function FlowWithProvider(...props) {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const flowId = searchParams.get('id')

  return (
    <div className="Flow-container">
      <ReactFlowProvider>
        <Flow flowId={flowId} />
      </ReactFlowProvider>
    </div>
  )
}

export default FlowWithProvider
