import database from '../sqlite.js'

const removeNodeFromFlow = (_, flowId, nodeId) => {
  console.log(
    `Node with id ${nodeId} attempt to be removed from flow ${flowId}.`
  )

  const stmt = database.prepare(
    'DELETE FROM flow_nodes WHERE flow_id = ? AND node_id = ?'
  )

  stmt.run(flowId, nodeId)

  console.log(
    `Node with id ${nodeId} was successfully removed from flow ${flowId}.`
  )
}

export default removeNodeFromFlow
