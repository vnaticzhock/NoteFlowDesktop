import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, { addEdge, useNodesState, useEdgesState } from 'reactflow';
import SuspenseDemoEditor from './SuspenseDemoEditor';
import {
  nodes as initialNodes,
  edges as initialEdges,
} from './initial-elements';
import 'reactflow/dist/style.css';

const DemoEditor = React.lazy(() => import('./DemoEditor'));

const onInit = (reactFlowInstance) =>
  console.log('flow loaded:', reactFlowInstance);

const TryMe = () => {
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isEdit, setIsEdit] = useState(false);
  const [editorId, setEditorId] = useState('');

  const onNodeDoubleClick = useCallback((event, node) => {
    setEditorId(node.id);
    setIsEdit(true);
  });

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  // we are using a bit of a shortcut here to adjust the edge type
  // this could also be done with a custom edge for example
  const edgesWithUpdatedTypes = edges.map((edge) => {
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
          onNodesChange={(param) => {
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
