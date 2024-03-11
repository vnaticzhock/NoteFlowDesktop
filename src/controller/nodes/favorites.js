import database from '../sqlite.js'
import fetchNode from './fetchNode.js'

const ensureTableExists = () => {
  const createTableStmt = `
        CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          node_id INTEGER UNIQUE,
          FOREIGN KEY(node_id) REFERENCES nodes(id)
        );
      `
  database.exec(createTableStmt)
}

const addNodeToFavorite = (_, nodeId) => {
  ensureTableExists()

  const stmt = database.prepare('INSERT INTO favorites (node_id) VALUES (?)')

  const info = stmt.run(nodeId)

  console.log(
    `A node was successfully added to Favorites with id ${info.lastInsertRowid}.`,
  )

  return {
    id: info.lastInsertRowid,
  }
}

const removeNodeFromFavorite = (_, nodeId) => {
  ensureTableExists()

  const stmt = database.prepare('DELETE FROM favorites WHERE node_id = ?')

  const info = stmt.run(nodeId)

  console.log(`Node with id ${nodeId} was successfully removed from Favorites.`)
}

const fetchIsFavorite = (_, nodeId) => {
  try {
    const stmt = database.prepare('SELECT * FROM favorites WHERE node_id = ?')

    const info = stmt.all(nodeId)[0]

    if (!info) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

const fetchFavoriteNodes = (_) => {
  try {
    const stmt = database.prepare('SELECT node_id FROM favorites')

    const info = [...new Set(stmt.all())]

    return info.map(({ node_id }, index) => {
      return fetchNode(_, node_id)
    })
  } catch (error) {
    return []
  }
}

export {
  addNodeToFavorite,
  fetchFavoriteNodes,
  fetchIsFavorite,
  removeNodeFromFavorite,
}
