import database from '../sqlite.js'

const deleteFlows = (event, id) => {
  const deleteFlowStmt = database.prepare('DELETE FROM flows WHERE id = ?')
  const deleteFlowNodesStmt = database.prepare(
    'DELETE FROM flow_nodes WHERE flow_id = ?',
  )

  database.transaction(() => {
    deleteFlowNodesStmt.run(id)
    const info = deleteFlowStmt.run(id)

    if (info.changes > 0) {
      console.log(`Flow with id ${id} was successfully deleted.`)
      return true
    }
    console.log(`No flow found with id ${id}.`)
    return false
  })()
}

export default deleteFlows
