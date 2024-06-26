import database from '../sqlite.js'

const deleteFlow = (event, id) => {
  const deleteFlowStmt = database.prepare('DELETE FROM flows WHERE id = ?')

  database.transaction(() => {
    try {
      const deleteFlowNodesStmt = database.prepare(
        'DELETE FROM flow_nodes WHERE flow_id = ?'
      )
      deleteFlowNodesStmt.run(id)
    } catch (error) {
      console.log(`No flow nodes from flow ${id} is deleted`)
    }
    const info = deleteFlowStmt.run(id)

    if (info.changes > 0) {
      console.log(`Flow with id ${id} was successfully deleted.`)
      return true
    }

    try {
      const info = deleteFlowStmt.run(id)
      if (info.changes > 0) {
        console.log(`Flow with id ${id} was successfully deleted.`)
        return true
      }
    } catch (error) {
      console.error(`Error deleting flow with id ${id}: ${error}`)
    }

    console.log(`No flow found with id ${id}.`)
    return false
  })()
}

export default deleteFlow
