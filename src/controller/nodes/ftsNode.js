import database from '../sqlite.js'

const ftsNodes = (_, query) => {
  try {
    const stmt = database.prepare(
      `SELECT rowid, * FROM nodes_fts WHERE nodes_fts MATCH ? ORDER BY rank;`
    )
    const nodes = stmt.all(query)

    return nodes.map(n => {
      return {
        ...n,
        id: n.rowid
      }
    })
  } catch (error) {
    return null
  }
}

export default ftsNodes
