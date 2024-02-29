import database from '../sqlite.js'

const fetchNode = (event, nodeId) => {
  // 到 sqlite server 裡面拿一些奇怪的東西 ?
  try {
    const stmt = database.prepare('SELECT * FROM nodes WHERE id = ?')
    const flows = stmt.all(nodeId)

    return flows
  } catch (error) {
    return []
  }
}

export default fetchNode
