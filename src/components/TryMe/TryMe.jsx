import "reactflow/dist/style.css";

import React, {useCallback, useState} from "react";
import ReactFlow, {addEdge, useEdgesState, useNodesState} from "reactflow";

import {edges as initialEdges, nodes as initialNodes} from "./initial-elements";
import SuspenseDemoEditor from "./SuspenseDemoEditor";

const DemoEditor = React.lazy(() => import("./DemoEditor"));

const onInit = reactFlowInstance =>
  console.log("flow loaded:", reactFlowInstance);

const TryMe = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isEdit, setIsEdit] = useState(false);
  const [editorId, setEditorId] = useState("");

  const onNodeDoubleClick = useCallback((event, node) => {
    setEditorId(node.id);
    setIsEdit(true);
  });

  const onConnect = useCallback(
    params => setEdges(eds => addEdge(params, eds)),
    [],
  );

  // we are using a bit of a shortcut here to adjust the edge type
  // this could also be done with a custom edge for example
  const edgesWithUpdatedTypes = edges.map(edge => {
    return edge;
  });

  return (
    <>
      {isEdit ? (
        <React.Suspense fallback={<SuspenseDemoEditor />}>
          <DemoEditor
            editorId={editorId}
            handleDrawerClose={() => setIsEdit(false)}
          />
        </React.Suspense>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edgesWithUpdatedTypes}
          onNodesChange={param => {
            onNodesChange(param);
          }}
          onEdgesChange={onEdgesChange}
          onNodeDoubleClick={onNodeDoubleClick}
          onConnect={onConnect}
          onInit={onInit}
          fitView
        />
      )}
    </>
  );
};

export default TryMe;
