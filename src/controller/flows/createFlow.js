import database from '../sqlite.js'

const ensureTableExists = () => {
  const createTableStmt = `
      CREATE TABLE IF NOT EXISTS flows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        thumbnail TEXT    -- 新增一個用來存儲縮圖Base64字符串的欄位
      );
    `
  database.exec(createTableStmt)
}

const createFlow = () => {
  ensureTableExists()

  const stmt = database.prepare('INSERT INTO flows (title) VALUES (?)')

  const info = stmt.run('Untitled')

  console.log(
    `A new flow was successfully added with id ${info.lastInsertRowid}.`
  )

  return {
    id: info.lastInsertRowid,
    title: 'Untitled'
  }
}

export default createFlow
