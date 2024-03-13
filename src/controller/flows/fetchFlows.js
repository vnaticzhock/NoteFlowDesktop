import database from '../sqlite.js'

const fetchFlows = async (_, offset) => {
  // 到 sqlite server 裡面拿一些奇怪的東西 ?
  const batchSize = 30
  try {
    const stmt = database.prepare('SELECT * FROM flows LIMIT ? OFFSET ?')
    const flows = stmt.all(batchSize, offset)

    return flows
  } catch (error) {
    return []
  }
}

const fetchFlow = async (_, flowId) => {
  try {
    const stmt = database.prepare('SELECT * FROM flows WHERE id = ?')
    const flows = stmt.all(flowId)

    return flows
  } catch (error) {
    return []
  }
}

export { fetchFlow, fetchFlows }
