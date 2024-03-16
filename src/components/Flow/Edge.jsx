import React from "react";
import {getBezierPath} from "reactflow";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  console.log("path", edgePath);

  return (
    <>
      <path id={id} style={style} d={edgePath} markerEnd={markerEnd} />
    </>
  );
}
