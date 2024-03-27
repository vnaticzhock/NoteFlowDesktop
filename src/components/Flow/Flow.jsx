import React, { useRef } from 'react'
import { Resizable } from 'react-resizable'
import 'react-resizable/css/styles.css'
import { useNavigate, useOutletContext } from 'react-router-dom'
import ReactFlow, { Controls, MiniMap, ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import {
  FlowControllerProvider,
  useFlowController
} from '../../providers/FlowController'
import { FlowManagementProvider } from '../../providers/FlowManager'
import Editor from '../NewEditor/Editor'
import './Flow.scss'
import CustomNode from './Node'
import NodeBar from './NodeBar'
import StyleBar from './StyleBar'
import ToolBar from './ToolBar'

const nodeTypes = {
  CustomNode
}

// const edgeTypes = {
//   CustomEdge,
// }

const Flow = () => {
  const { flowId } = useOutletContext()
  const {
    deleteComponent,
    openStyleBar,
    closeStyleBar,
    nodeChangeStyle,
    onDragOver,
    onDrop,
    onNodeEdit,
    onNodeContextMenu,
    onNodeClick,
    onNodeDoubleClick,
    onPaneClick,
    addNode,
    onConnect,
    onEdgeUpdate,
    onEditorResize,
    onNodeDragStart,
    onNodeDragStop,
    onNodesChangeHandler,
    onEdgesChangeHandler,
    closeNodeBar,
    openNodeBar,
    leaveEditing,
    nodeChangeStyleId,
    editorId,
    lastSelectedNode,
    isNodeBarOpen,
    editorWidth,
    edges,
    nodes,
    windowWidth,
    nodeEditor,
    nodeEditorId
  } = useFlowController()

  const miniRef = useRef()
  const canvasRef = useRef()
  const navigateTo = useNavigate()

  return (
    <div className="FlowEditPanel" ref={canvasRef}>
      <ReactFlow
        className="NodePanel"
        fitView={true}
        nodes={nodes}
        edges={edges}
        onDrop={onDrop}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onEdgeUpdate={onEdgeUpdate}
        onConnect={onConnect}
        snapToGrid={true} // node 移動的單位要跟 grid 一樣的關鍵！
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        // edgeTypes={edgeTypes}
      >
        {nodeChangeStyleId ? (
          <StyleBar
            handleStyleBarClose={closeStyleBar}
            nodes={nodes}
            nodeId={nodeChangeStyleId}
            nodeChangeStyle={nodeChangeStyle}
          />
        ) : null}
        {isNodeBarOpen ? (
          <NodeBar handleNodeBarClose={closeNodeBar} setDragNode={null} />
        ) : null}
        <ToolBar
          addNode={addNode}
          backToHome={() => navigateTo('/')}
          handleNodeBarOpen={openNodeBar}
          lastSelectedNode={lastSelectedNode}
          isNodeSelected={lastSelectedNode} // ??
          onNodeEdit={onNodeEdit}
          flowId={flowId}
        />
        <MiniMap innerRef={miniRef} nodeStrokeWidth={10} zoomable pannable />
        <Controls />
        {/* <Background color="#ccc" variant={bgVariant} /> */}
      </ReactFlow>

      {editorId && (
        <Resizable
          height={Infinity}
          width={editorWidth}
          onResize={onEditorResize}
          resizeHandles={['w']}
          minConstraints={[windowWidth * 0.8, Infinity]}
          maxConstraints={[windowWidth * 1.2, Infinity]}>
          <div className="Node-container" style={{ width: `${editorWidth}px` }}>
            <Editor editorId={editorId} />
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
          <FlowControllerProvider>
            <Flow />
          </FlowControllerProvider>
        </FlowManagementProvider>
      </ReactFlowProvider>
    </div>
  )
}

export default FlowProvider
