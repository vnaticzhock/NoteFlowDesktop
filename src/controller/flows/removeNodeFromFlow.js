import database from "../sqlite.js";

const removeNodeFromFlow = (flowId, nodeId) => {
  const stmt = database.prepare(
    "DELETE FROM flow_nodes WHERE flow_id = ? AND node_id = ?",
  );

  stmt.run(flowId, nodeId);

  console.log(
    `Node with id ${nodeId} was successfully removed from flow ${flowId}.`,
  );
};

export default removeNodeFromFlow;
