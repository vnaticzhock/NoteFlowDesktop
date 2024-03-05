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
import {
  createNode,
  addNodeToFlow,
  fetchNodesInFlow,
  removeNodeFromFlow,
  addEdgeInFlow,
  removeEdgeFromFlow,
  fetchEdges,
} from '../../apis/APIs'
import {
  FlowManagementProvider,
  useFlowManager,
} from '../../providers/FlowManager'
import CustomEdge from './Edge'

const nodeTypes = {
  CustomNode,
}

const edgeTypes = {
  CustomEdge,
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
  const subRef = useRef(null)
  const miniRef = useRef()

  const [bgVariant, setBgVariant] = useState('line')
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [isStyleBarOpen, setIsStyleBarOpen] = useState(false)
  const [back, setBack] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [nodeWidth, setNodeWidth] = useState(window.innerWidth * 0.4)
  // const { flowWebSocket, renewFlowWebSocket, renameTab } = usePageTab()
  const [isNodeBarOpen, setIsNodeBarOpen] = useState(false)
  const [dragNode, setDragNode] = useState({})
  const [changeStyleId, setChangeStyleId] = useState(null)
  const [changeStyleContent, setChangeStyleContent] = useState(null)
  const [nodeEditingId, setNodeEditingid] = useState(null)

  // for node remove
  const [lastSelectedNode, setLastSelectedNode] = useState(null)
  const [lastSelectedEdge, setLastSelectedEdge] = useState(null)

  const deleteComponent = (event) => {
    console.log('delete component disabled')
    // removeNodeFromFlow(flowId, event.target.dataset.id)
  }

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

  const onDrop = useCallback((event) => {
    event.preventDefault()

    console.log('drop.')

    const type = event.dataTransfer.getData('application/reactflow')
    if (typeof type === 'undefined' || !type) {
      return
    }
    const position = {
      x: -x + event.clientX / zoom,
      y: -y + event.clientY / zoom,
    }
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
      setEdges((edges) => addEdge({ id: edges.length, ...params }, edges))
      addEdgeInFlow(
        flowId,
        params.source,
        params.target,
        params.sourceHandle,
        params.targetHandle,
      )
    },
    [flowId],
  )

  const onEdgeUpdate = useCallback(
    (prev, after) => {
      setEdges((allEdges) => updateEdge(prev, after, allEdges))
      removeEdgeFromFlow(
        flowId,
        prev.source,
        prev.target,
        prev.sourceHandle,
        prev.targetHandle,
      ).then(() => {
        addEdgeInFlow(
          flowId,
          after.source,
          after.target,
          after.sourceHandle,
          after.targetHandle,
        )
      })
    },
    [flowId],
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

  const backToHome = () => {
    setBack(true)
  }

  const onNodeDoubleClick = useCallback((event, node) => {
    zoom = 2
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
              label: each.label,
              toolbarPosition: Position.Right,
              openStyleBar: (id) => {
                openStyleBar(id)
              },
              onLabelChange: (id, event) => {
                onLabelChange(id, event)
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
    fetchEdges(flowId).then((data) => {
      console.log('data:', data)
      setEdges(
        data.map((each, index) => {
          return {
            id: index,
            source: each.source.toString(),
            target: each.target.toString(),
            sourceHandle: each.sourceHandle,
            targetHandle: each.targetHandle,
          }
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
            onNodesChange(param)
            setLastSelectedEdge(null)
          }}
          onEdgesChange={(params) => {
            params.forEach((param, i) => {
              if (param.type === 'remove') {
                // removeEdgeFromFlow(
                //   flowId,
                //   edges[param.id].source,
                //   edges[param.id].target,
                // )
              }
            })
            setLastSelectedNode(null)
            setLastSelectedEdge(params[0].id)
            onEdgesChange(params)

            // flowWebSocket.editComponent(param, 'edge')
          }}
          onEdgeUpdate={onEdgeUpdate}
          onConnect={onConnect}
          snapToGrid={true} // node 移動的單位要跟 grid 一樣的關鍵！
          onNodeDoubleClick={(event, node) => {
            onNodeDoubleClick(event, node)
          }}
          onNodeClick={(event, node) => {
            onNodeClick(event, node)
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
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
              handleNodeBarClose={() => setIsNodeBarOpen(false)}
              setDragNode={setDragNode}
            />
          ) : null}
          <ToolBar
            addNode={addNode}
            backToHome={backToHome}
            handleNodeBarOpen={() => setIsNodeBarOpen(true)}
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
