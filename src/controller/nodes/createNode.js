import database from '../sqlite.js'

const ensureNodesExists = () => {
  const createTableStmt = `
        CREATE TABLE IF NOT EXISTS nodes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          content TEXT,
          update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          add_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
  database.exec(createTableStmt)
}

const createNode = () => {
  ensureNodesExists()

  const stmt = database.prepare(
    'INSERT INTO nodes (title, content, update_time, add_time) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
  )

  const info = stmt.run('Untitled', '')

  console.log(
    `A new flow was successfully added with id ${info.lastInsertRowid}.`,
  )

  return {
    id: info.lastInsertRowid,
  }
}

export default createNode
