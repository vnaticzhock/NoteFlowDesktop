import database from "../sqlite.js";

const fetchNodesInFlow = (_, flowId) => {
  try {
    const stmt = database.prepare("SELECT * FROM flow_nodes WHERE flow_id = ?");

    const nodes = stmt.all(flowId);

    return nodes;
  } catch (error) {
    return [];
  }
};

export default fetchNodesInFlow;
