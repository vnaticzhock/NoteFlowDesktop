import database from '../sqlite.js'

const assureTableExists = () => {
  // 創建表格，如果表格不存在的話
  database.exec(`
  CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY,
    lang TEXT
  )
`)
}

const getLanguage = () => {
  assureTableExists()
  const stmt = database.prepare('SELECT lang FROM languages LIMIT 1')
  const row = stmt.get()
  return row ? row.lang : 'en'
}

const editLanguage = (_, lang) => {
  assureTableExists()
  const stmt = database.prepare(
    'INSERT OR REPLACE INTO languages (id, lang) VALUES (1, ?)',
  )
  stmt.run(lang)
}

export { getLanguage, editLanguage }
