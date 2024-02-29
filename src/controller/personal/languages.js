import Database from 'better-sqlite3'

// 初始化 SQLite 數據庫連接
const db = new Database('./public/database.db')

// 創建表格，如果表格不存在的話
db.exec(`
  CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY,
    lang TEXT
  )
`)

const getLanguage = () => {
  const stmt = db.prepare('SELECT lang FROM languages LIMIT 1')
  const row = stmt.get()
  return row ? row.lang : 'en'
}

const editLanguage = (_, lang) => {
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO languages (id, lang) VALUES (1, ?)',
  )
  stmt.run(lang)
}

export { getLanguage, editLanguage }
