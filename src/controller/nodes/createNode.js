import database from '../sqlite.js'

const ensureNodesExists = () => {
  const createTableStmt = `
        CREATE TABLE IF NOT EXISTS nodes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          content TEXT,
          update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          add_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`

  const createFtsTableStmt = `CREATE VIRTUAL TABLE IF NOT EXISTS nodes_fts USING fts5(title, content, content=nodes, content_rowid=id);`

  const insertTrigger = `CREATE TRIGGER IF NOT EXISTS nodes_ai AFTER INSERT ON nodes BEGIN
          INSERT INTO nodes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
        END;`

  const deleteTrigger = `CREATE TRIGGER IF NOT EXISTS nodes_ad AFTER DELETE ON nodes BEGIN
          INSERT INTO nodes_fts(nodes_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content);
        END;`

  const updateTrigger = `CREATE TRIGGER IF NOT EXISTS nodes_au AFTER UPDATE ON nodes BEGIN
          INSERT INTO nodes_fts(nodes_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content);
          INSERT INTO nodes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
        END;`

  database.exec(createTableStmt)
  database.exec(createFtsTableStmt)
  database.exec(insertTrigger)
  database.exec(deleteTrigger)
  database.exec(updateTrigger)
}

const createNode = () => {
  ensureNodesExists()

  const stmt = database.prepare(
    'INSERT INTO nodes (title, content, update_time, add_time) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
  )

  const info = stmt.run('Untitled', '')

  console.log(
    `A new flow was successfully added with id ${info.lastInsertRowid}.`
  )

  return {
    id: info.lastInsertRowid
  }
}

export default createNode
