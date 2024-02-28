import Database from 'better-sqlite3'

const database = new Database('./database.db', { verbose: console.log })

const ensureTableExists = () => {
  const createTableStmt = `
      CREATE TABLE IF NOT EXISTS flows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT
      );
    `
  database.exec(createTableStmt)
}

const createFlow = () => {
  ensureTableExists()

  const stmt = database.prepare('INSERT INTO flows (data) VALUES (?)')

  const info = stmt.run('0')

  console.log(
    `A new flow was successfully added with id ${info.lastInsertRowid}.`,
  )

  return info.lastInsertRowid
}

export default createFlow
