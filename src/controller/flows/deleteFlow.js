import Database from 'better-sqlite3'

const database = new Database('./database.db', { verbose: console.log })

const deleteFlows = (id) => {
  const stmt = database.prepare('DELETE FROM flows WHERE id = ?')

  const info = stmt.run(id)

  if (info.changes > 0) {
    console.log(`Flow with id ${id} was successfully deleted.`)
    return true
  }
  console.log(`No flow found with id ${id}.`)
  return false
}

export default deleteFlows
