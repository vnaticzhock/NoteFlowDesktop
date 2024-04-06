import database from '../sqlite.js'

const assureTableExists = () => {
  const statement = `
    CREATE TABLE IF NOT EXISTS flow_edges (
      flow_id INTEGER,
      id TEXT,
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

const duplicateEdge = (
  flowId: string,
  source: string,
  target: string,
  sourceHandle: string,
  targetHandle: string
) => {
  const existingEdge = database.prepare(
    'SELECT * FROM flow_edges WHERE flow_id = ? AND source = ? AND target = ? AND sourceHandle = ? AND targetHandle = ?'
  )
  const result = existingEdge.all(
    flowId,
    source,
    target,
    sourceHandle,
    targetHandle
  )

  return result.length > 0
}

const existingEdgeId = (flowId: string, id: string) => {
  const existingEdge = database.prepare(
    'SELECT * FROM flow_edges WHERE flow_id = ? AND id = ?'
  )
  const result = existingEdge.all(flowId, id)
  return result.length > 0
}

const fetchEdges = (_, flowId: string) => {
  try {
    const stmt = database.prepare('SELECT * FROM flow_edges WHERE flow_id = ?')
    const edges = stmt.all(flowId)

    console.log(edges)

    return edges
  } catch (error) {
    return []
  }
}

const addEdge = (
  _,
  flowId: string,
  id: string,
  nodeIdSrc: string,
  nodeIdTgt: string,
  sourceHandle,
  targetHandle,
  style
) => {
  assureTableExists()

  /** addEdge 的規矩：
   *  1. source 跟 target 都一樣的不能成行（反過來的可以）
   *  2. 如果 flowId & id 都一樣，那麼就去採用 delete + add (or update)
   *  3. 如果上述都過得去，那麼直接採用 add
   */
  if (!sourceHandle || !targetHandle) {
    console.error('error! source handle or target handle not specified. break.')
    return
  }

  if (duplicateEdge(flowId, nodeIdSrc, nodeIdTgt, sourceHandle, targetHandle)) {
    console.error(
      `error! tuple (nodeIdSrc, nodeIdTgt): (${nodeIdSrc}, ${nodeIdTgt}) already exists in flow ${flowId}`
    )
    return
  }
  if (existingEdgeId(flowId, id)) {
    // delete it.
    removeEdge('', flowId, id)
  }

  const stmt = database.prepare(
    'INSERT INTO flow_edges (flow_id, id, source, target, sourceHandle, targetHandle, style) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )

  stmt.run(flowId, id, nodeIdSrc, nodeIdTgt, sourceHandle, targetHandle, style)

  console.log(
    `Edge id ${id} between ${nodeIdSrc} and ${nodeIdTgt} was successfully added to flow ${flowId}.`
  )
}

const removeEdge = (_, flowId: string, id: string) => {
  const stmt = database.prepare(
    'DELETE FROM flow_edges WHERE flow_id = ? AND id = ?'
  )

  stmt.run(flowId, id)

  console.log(`Edge id ${id} was successfully removed from flow ${flowId}.`)
}

export { addEdge, fetchEdges, removeEdge }
