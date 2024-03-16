import database from '../sqlite.js'

const assureTableExists = () => {
  const statement = `
    CREATE TABLE IF NOT EXISTS flow_edges (
      flow_id INTEGER,
      source INTEGER,
      target INTEGER,
      sourceHandle TEXT,
      targetHandle TEXT,
      style TEXT,
      FOREIGN KEY(flow_id) REFERENCES flows(id),
      FOREIGN KEY(source) REFERENCES nodes(id),
      FOREIGN KEY(target) REFERENCES nodes(id)
    );
  `
  database.exec(statement)
}

const edgeExists = (
  flowId,
  source,
  target,
  sourceHandle,
  targetHandle,
  style
) => {
  const existingEdge = database.prepare(
    'SELECT COUNT(*) AS count FROM flow_edges WHERE flow_id = ? AND source = ? AND target = ? AND sourceHandle = ? AND targetHandle = ? AND style = ?'
  )
  const result = existingEdge.get(
    flowId,
    source,
    target,
    sourceHandle,
    targetHandle,
    style
  )
  return result.count > 0
}

const fetchEdges = (_, flowId) => {
  try {
    const stmt = database.prepare('SELECT * FROM flow_edges WHERE flow_id = ?')
    const edges = stmt.all(flowId)

    return edges
  } catch (error) {
    return []
  }
}

const addEdge = (
  _,
  flowId,
  nodeIdSrc,
  nodeIdTgt,
  sourceHandle,
  targetHandle,
  style
) => {
  assureTableExists()

  if (
    !edgeExists(flowId, nodeIdSrc, nodeIdTgt, sourceHandle, targetHandle, style)
  ) {
    if (!sourceHandle || !targetHandle) {
      console.log('error! source handle or target handle not specified. break.')
    } else {
      const stmt = database.prepare(
        'INSERT INTO flow_edges (flow_id, source, target, sourceHandle, targetHandle, style) VALUES (?, ?, ?, ?, ?, ?)'
      )

      stmt.run(flowId, nodeIdSrc, nodeIdTgt, sourceHandle, targetHandle, style)

      console.log(
        `Edge between ${nodeIdSrc} and ${nodeIdTgt} was successfully added to flow ${flowId}.`
      )
    }
  }
}

const removeEdge = (
  _,
  flowId,
  nodeIdSrc,
  nodeIdTgt,
  sourceHandle,
  targetHandle
) => {
  assureTableExists()

  try {
    const stmt = database.prepare(
      'DELETE FROM flow_edges WHERE flow_id = ? AND source = ? AND target = ? AND sourceHandle = ? AND targetHandle = ?'
    )

    stmt.run(flowId, nodeIdSrc, nodeIdTgt, sourceHandle, targetHandle)

    console.log(
      `Edge between ${nodeIdSrc} and ${nodeIdTgt} was successfully removed from flow ${flowId}.`
    )
  } catch (error) {}
}

export { addEdge, fetchEdges, removeEdge }
