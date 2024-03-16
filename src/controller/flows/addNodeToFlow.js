// addNodeToFlow.js

import database from "../sqlite.js";

const ensureFlowNodesTableExists = () => {
  const createTableStmt = `
      CREATE TABLE IF NOT EXISTS flow_nodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flow_id INTEGER,
        node_id INTEGER,
        label TEXT,
        xpos REAL,
        ypos REAL,
        style TEXT,
        FOREIGN KEY(flow_id) REFERENCES flows(id),
        FOREIGN KEY(node_id) REFERENCES nodes(id)
      );
    `;
  database.exec(createTableStmt);
};

const addNodeToFlow = (_, flowId, nodeId, xpos, ypos, style) => {
  ensureFlowNodesTableExists();

  const stmt = database.prepare(
    "INSERT INTO flow_nodes (flow_id, node_id, label, xpos, ypos, style) VALUES (?, ?, ?, ?, ?, ?)",
  );

  stmt.run(flowId, nodeId, "Untitle", xpos, ypos, JSON.stringify(style));

  console.log(
    `Node with id ${nodeId} was successfully added to flow ${flowId}.`,
  );
};

export default addNodeToFlow;
