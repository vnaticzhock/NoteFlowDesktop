import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Position,
  addEdge,
  updateEdge,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useViewport,
} from "reactflow";

import {
  addEdgeInFlow,
  addNodeToFlow,
  createNode,
  fetchEdges,
  fetchNodesInFlow,
  removeEdgeFromFlow,
} from "../apis/APIs";
import {useFlowManager} from "./FlowManager";

const FlowControllerContext = createContext({
  deleteComponent: () => {},
  onNodeLabelChange: () => {},
  openStyleBar: () => {},
  closeStyleBar: () => {},
  nodeChangeStyle: () => {},
  onDragOver: () => {},
  onDrop: () => {},
  onNodeClick: () => {},
  onNodeDoubleClick: () => {},
  onPaneClick: () => {},
  addNode: () => {},
  onConnect: () => {},
  onEdgeUpdate: () => {},
  openNodeContextMenu: () => {},
  onResize: () => {},
  onNodeDragStart: () => {},
  onNodeDragStop: () => {},
  onNodesChangeHandler: () => {},
  onEdgesChangeHandler: () => {},
  openNodeBar: () => {},
  closeNodeBar: () => {},
  startEditing: id => {},
  leaveEditing: () => {},
  isNodeSelected: id => {},
  isEdgeSelected: id => {},
  nodes: [],
  edges: [],
  selectedNodes: [],
  isStyleBarOpen: false,
  isNodeBarOpen: false,
  changeStyleId: 1,
  nodeEditingId: 1,
  lastSelectedNode: 1,
  nodeWidth: 10,
});

const defaultNodeStyle = {
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "black",
  background: "white",
  borderRadius: 10,
  height: 50,
  width: 150,
};

export const FlowControllerProvider = ({children}) => {
  const {flowId, needUpdatedHandler} = useFlowManager();

  let {x, y, zoom} = useViewport();

  const xPos = useRef(50);
  const yPos = useRef(0);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [isStyleBarOpen, setIsStyleBarOpen] = useState(false);
  const [isNodeBarOpen, setIsNodeBarOpen] = useState(false);
  const [changeStyleId, setChangeStyleId] = useState(null);
  const [changeStyleContent, setChangeStyleContent] = useState(null);
  const dragNode = useRef({});

  const [nodeEditingId, setNodeEditingid] = useState(null);
  const [lastSelectedNode, setLastSelectedNode] = useState(null);
  const [lastSelectedEdge, setLastSelectedEdge] = useState(null);
  const [nodeWidth, setNodeWidth] = useState(window.innerWidth * 0.4);

  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);

  useOnSelectionChange({
    onChange: ({nodes, edges}) => {
      setSelectedNodes(nodes.map(node => node.id));
      setSelectedEdges(edges.map(edge => edge.id));
    },
  });

  const isNodeSelected = useCallback(
    id => {
      // console.log(id, 'selected?', selectedNodes.indexOf(id) !== -1)
      return selectedNodes.indexOf(id) !== -1;
    },
    [selectedNodes],
  );
  const isEdgeSelected = useCallback(
    id => {
      return selectedEdges.indexOf(id) !== -1;
    },
    [selectedEdges],
  );

  const deleteComponent = event => {
    console.log("delete component disabled");
    // removeNodeFromFlow(flowId, event.target.dataset.id)
  };

  const openNodeContextMenu = () => {};

  const onNodeLabelChange = (id, event) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id == id) {
          node.data = {
            ...node.data,
            label: event.target.value,
          };
        }
        return node;
      }),
    );
  };

  const onDragOver = useCallback(event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    event => {
      event.preventDefault();

      console.log("drop.");

      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }
      const position = {
        x: -x + event.clientX / zoom,
        y: -y + event.clientY / zoom,
      };
      const editorId = dragNode.id;
    },
    [dragNode],
  );

  const onConnect = useCallback(
    params => {
      setEdges(edges => addEdge({id: edges.length, ...params}, edges));
      addEdgeInFlow(
        flowId,
        params.source,
        params.target,
        params.sourceHandle,
        params.targetHandle,
      );
    },
    [flowId],
  );

  const onEdgeUpdate = useCallback(
    (prev, after) => {
      setEdges(allEdges => updateEdge(prev, after, allEdges));
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
        );
      });
    },
    [flowId],
  );

  const onNodeDoubleClick = useCallback((event, node) => {
    zoom = 2;
    startEditing(node.id);
    setLastSelectedEdge(null);
    // setIsEdit(true)
    console.log("node double click");
  }, []);

  const onNodeDragStart = useCallback((event, node) => {
    dragNode.current = {x: node.position.x, y: node.position.y};
  }, []);

  const onNodeDragStop = useCallback((event, node) => {
    if (
      node.position.x != dragNode.current.x ||
      node.position.y != dragNode.current.y
    ) {
      needUpdatedHandler("nodes", node.id, {
        xpos: node.position.x,
        ypos: node.position.y,
      });
    }
  }, []);

  const onNodeClick = useCallback((event, node) => {
    console.log("click on node.");
    setLastSelectedNode(node.id);
  }, []);

  const onNodesChangeHandler = useCallback(param => {
    // 這個太及時了！如果要慢慢更新的話，使用 onNodeDragStop 會比較實惠一點
    onNodesChange(param);
    setLastSelectedEdge(null);
  }, []);

  const onEdgesChangeHandler = useCallback(params => {
    params.forEach((param, i) => {
      if (param.type === "remove") {
        // removeEdgeFromFlow(
        //   flowId,
        //   edges[param.id].source,
        //   edges[param.id].target,
        // )
      } else if (param.type === "select") {
        setLastSelectedEdge(params[0].id);
      }
    });
    onEdgesChange(params);
  }, []);

  const onPaneClick = useCallback((event, node) => {
    console.log("pane click.");
    setLastSelectedNode(null);
    setLastSelectedEdge(null);
  }, []);

  const onResize = (event, {element, size, handle}) => {
    setNodeWidth(size.width);
  };

  const addNode = useCallback(async () => {
    yPos.current += 50;
    if (yPos.current > 400) {
      yPos.current = 50;
      xPos.current += 150;
    }
    const nodeId = (await createNode()).id;
    console.log(`add note to flow: node_id: ${nodeId}; flow_id: ${flowId}`);
    addNodeToFlow(flowId, nodeId, xPos.current, yPos.current, defaultNodeStyle);

    const node = {
      id: nodeId.toString(),
      data: {
        label: "Untitle",
        toolbarPosition: Position.Right,
        openStyleBar: id => {
          openStyleBar(id);
        },
      },
      type: "CustomNode",
      position: {x: xPos.current, y: yPos.current},
      style: defaultNodeStyle,
      class: "Node",
    };

    setNodes(data => data.concat(node));
    // pasteNodeToFlow(id, xPos, yPos)
  }, [setNodes, flowId]);

  const openStyleBar = id => {
    console.log("style!");
    setIsStyleBarOpen(true);
    setChangeStyleId(id);
  };

  const closeStyleBar = () => {
    setIsStyleBarOpen(false);
    setChangeStyleId(null);
    setChangeStyleContent(null);
  };

  const openNodeBar = () => {
    setIsNodeBarOpen(false);
  };

  const closeNodeBar = () => {
    setIsNodeBarOpen(false);
  };

  const startEditing = useCallback(id => {
    setNodeEditingid(id);
  }, []);

  const leaveEditing = useCallback(() => {
    setNodeEditingid(null);
  }, []);

  const nodeChangeStyle = (id, event, type) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === id) {
          switch (type) {
            case "background":
              node.style = {
                ...node.style,
                background: event.target.value,
              };
              setChangeStyleContent(node.style);
              break;
            case "color":
              node.style = {
                ...node.style,
                borderColor: event.target.value,
              };
              setChangeStyleContent(node.style);
              break;
            case "stroke":
              node.style = {
                ...node.style,
                borderWidth: event.target.value,
              };
              setChangeStyleContent(node.style);
              break;
          }
        }
        return node;
      }),
    );
  };

  const eventHandler = useCallback(event => {
    if (event.key === "Delete") {
      deleteComponent(event);
    }
  }, []);

  useEffect(() => {
    if (lastSelectedNode !== nodeEditingId) {
      document.addEventListener("keydown", eventHandler);
      return () => document.removeEventListener("keydown", eventHandler);
    }
  }, [lastSelectedNode, lastSelectedEdge, nodeEditingId]);

  useEffect(() => {
    if (nodeEditingId) {
      setIsNodeBarOpen(false);
      setIsStyleBarOpen(false);
    }
  }, [nodeEditingId]);

  useEffect(() => {
    if (!flowId || flowId < 0) return;
    fetchNodesInFlow(flowId).then(data => {
      setNodes(
        data.map(each => {
          const nodeId = each.node_id.toString();
          const style = JSON.parse(each.style);
          const node = {
            id: nodeId,
            data: {
              label: each.label,
              toolbarPosition: Position.Right,
              openStyleBar: id => {
                openStyleBar(id);
              },
            },
            type: "CustomNode",
            position: {x: each.xpos, y: each.ypos},
            style,
            class: "Node",
          };

          return node;
        }),
      );
    });
    fetchEdges(flowId).then(data => {
      setEdges(
        data.map((each, index) => {
          return {
            id: index,
            source: each.source.toString(),
            target: each.target.toString(),
            sourceHandle: each.sourceHandle,
            targetHandle: each.targetHandle,
          };
        }),
      );
    });
  }, [flowId]);

  return (
    <FlowControllerContext.Provider
      value={{
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
        openNodeBar,
        closeNodeBar,
        startEditing,
        leaveEditing,
        isNodeSelected,
        isEdgeSelected,
        isNodeBarOpen,
        isStyleBarOpen,
        lastSelectedNode,
        selectedNodes,
        changeStyleId,
        nodeEditingId,
        nodeWidth,
        nodes,
        edges,
      }}>
      {children}
    </FlowControllerContext.Provider>
  );
};

const useFlowController = () => useContext(FlowControllerContext);

export {useFlowController};
