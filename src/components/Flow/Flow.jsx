import "react-resizable/css/styles.css";
import "reactflow/dist/style.css";
import "./Flow.scss";

import React, {useRef, useState} from "react";
import {Resizable} from "react-resizable";
import {useNavigate} from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from "reactflow";

import {
  FlowControllerProvider,
  useFlowController,
} from "../../providers/FlowController";
import {
  FlowManagementProvider,
  useFlowManager,
} from "../../providers/FlowManager";
import {Editor} from "../Editor/Editor";
import CustomNode from "./Node";
import NodeBar from "./NodeBar";
import StyleBar from "./StyleBar";
import ToolBar from "./ToolBar";

const nodeTypes = {
  CustomNode,
};

// const edgeTypes = {
//   CustomEdge,
// }

const Flow = () => {
  const {flowId} = useFlowManager();
  const navigateTo = useNavigate();
  const {
    deleteComponent,
    onNodeLabelChange,
    openStyleBar,
    closeStyleBar,
    nodeChangeStyle,
    onDragOver,
    onDrop,
    onNodeClick,
    onNodeDoubleClick,
    onPaneClick,
    addNode,
    onConnect,
    onEdgeUpdate,
    openNodeContextMenu,
    onResize,
    onNodeDragStart,
    onNodeDragStop,
    onNodesChangeHandler,
    onEdgesChangeHandler,
    closeNodeBar,
    openNodeBar,
    leaveEditing,
    changeStyleId,
    nodeEditingId,
    lastSelectedNode,
    isStyleBarOpen,
    isNodeBarOpen,
    nodeWidth,
    edges,
    nodes,
  } = useFlowController();

  const miniRef = useRef();
  const canvasRef = useRef();
  const [bgVariant, setBgVariant] = useState("line");

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
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        // edgeTypes={edgeTypes}
      >
        {changeStyleId ? (
          <StyleBar
            handleStyleBarClose={closeStyleBar}
            nodes={nodes}
            nodeId={changeStyleId}
            nodeChangeStyle={nodeChangeStyle}
          />
        ) : null}
        {isNodeBarOpen ? (
          <NodeBar handleNodeBarClose={closeNodeBar} setDragNode={null} />
        ) : null}
        <ToolBar
          addNode={addNode}
          backToHome={() => navigateTo("/")}
          handleNodeBarOpen={openNodeBar}
          changeBackground={setBgVariant}
          isNodeSelected={lastSelectedNode}
          openNodeContextMenu={openNodeContextMenu}
          flowId={flowId}
        />
        <MiniMap ref={miniRef} nodeStrokeWidth={10} zoomable pannable />
        <Controls />
        <Background color="#ccc" variant={bgVariant} />
      </ReactFlow>

      {nodeEditingId && (
        <Resizable
          height={Infinity}
          width={nodeWidth}
          onResize={onResize}
          resizeHandles={["w"]}
          minConstraints={[window.innerWidth * 0.37, Infinity]}
          maxConstraints={[window.innerWidth * 0.7, Infinity]}>
          <div className="Node-container" style={{width: `${nodeWidth}px`}}>
            <div className="editor">
              <Editor
                editorId={nodeEditingId}
                handleDrawerClose={leaveEditing}
              />
            </div>
          </div>
        </Resizable>
      )}
    </div>
  );
};

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
  );
};

export default FlowProvider;
