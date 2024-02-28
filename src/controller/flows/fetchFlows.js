import Database from 'better-sqlite3'

const database = new Database('./database.db', { verbose: console.log })

const fetchFlows = async (event, page) => {
  // 到 sqlite server 裡面拿一些奇怪的東西 ?
  const batchSize = 30
  const offset = page * batchSize
  try {
    const stmt = database.prepare('SELECT * FROM flows LIMIT ? OFFSET ?')
    const flows = stmt.all(batchSize, offset)

    return flows
  } catch (error) {
    return []
  }
}

export default fetchFlows
