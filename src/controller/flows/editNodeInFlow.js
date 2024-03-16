import database from "../sqlite.js";

const editNodeInFlow = (_, flowId, nodeId, data) => {
  let updateStmt = "UPDATE flow_nodes SET ";
  const updateValues = [];

  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      updateStmt += `${key} = ?, `;
      updateValues.push(data[key]);
    }
  }

  updateStmt = updateStmt.slice(0, -2);
  updateStmt += " WHERE flow_id = ? AND node_id = ?";

  updateValues.push(flowId, nodeId);

  const stmt = database.prepare(updateStmt);

  stmt.run(updateValues);

  console.log(
    `Node with id ${nodeId} in flow ${flowId} was successfully updated.`,
  );
};

export default editNodeInFlow;
