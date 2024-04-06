import React, { useRef } from 'react'
import { Resizable } from 'react-resizable'
import 'react-resizable/css/styles.css'
import { useNavigate, useOutletContext } from 'react-router-dom'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider
} from 'reactflow'
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

const edgeTypes = {}

const Flow = () => {
  const { flowId } = useOutletContext()
  const {
    closeStyleBar,
    nodeChangeStyle,
    onDragOver,
    onDrop,
    onNodeContextMenu,
    onNodeClick,
    onNodeDoubleClick,
    onPaneClick,
    onPaneContextMenu,
    addNode,
    onConnect,
    onEdgeUpdate,
    onEditorResize,
    onNodeDrag,
    onNodeDragStart,
    onNodeDragStop,
    onNodesChangeHandler,
    onEdgesChangeHandler,
    closeNodeBar,
    openNodeBar,
    leaveNodeEditing,
    leaveEditing,
    nodeChangeStyleId,
    editorId,
    lastSelectedNode,
    isNodeBarOpen,
    editorWidth,
    edges,
    nodes,
    windowWidth
  } = useFlowController()

  const miniRef = useRef()
  const navigateTo = useNavigate()

  return (
    <div className="FlowEditPanel">
      <ReactFlow
        className="NodePanel"
        fitView={true}
        panOnDrag={true}
        nodes={nodes}
        edges={edges}
        onDrop={onDrop}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onNodeDrag={onNodeDrag}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onEdgeUpdate={onEdgeUpdate}
        onConnect={onConnect}
        snapToGrid={true} // node 移動的單位要跟 grid 一樣的關鍵！
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        // delete functionality to be implemented
        // onNodesDelete={onNodesDelete}
        edgeTypes={edgeTypes}>
        {nodeChangeStyleId ? (
          <StyleBar
            handleStyleBarClose={closeStyleBar}
            nodes={nodes}
            nodeId={nodeChangeStyleId}
            nodeChangeStyle={nodeChangeStyle}
          />
        ) : null}
        {isNodeBarOpen && (
          <NodeBar handleNodeBarClose={closeNodeBar} setDragNode={null} />
        )}
        <ToolBar
          addNode={addNode}
          backToHome={() => {
            navigateTo('/')
            leaveNodeEditing()
            leaveEditing()
          }}
          handleNodeBarOpen={openNodeBar}
          lastSelectedNode={lastSelectedNode}
          flowId={flowId}
        />
        <MiniMap innerRef={miniRef} nodeStrokeWidth={10} zoomable pannable />
        <Controls />
        <Background color="red" />
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
