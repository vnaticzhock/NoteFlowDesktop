import fs from 'fs'
import util from 'util'

import database from '../sqlite.js'

const ensureTableExists = () => {
  const createTableStmt = `
      CREATE TABLE IF NOT EXISTS personal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        avatar TEXT    -- 新增一個用來存儲縮圖Base64字符串的欄位
      );
    `
  database.exec(createTableStmt)
}

const readFile = util.promisify(fs.readFile)

const uploadPhoto = async (_, photo_path) => {
  ensureTableExists()

  const photo = (await readFile(photo_path)).toString('base64')
  const photoString = `data:image/png;base64,${photo}`
  const stmt = database.prepare(
    `
      INSERT INTO personal (avatar) VALUES (?)
    `,
  )

  const info = stmt.run(photoString)

  console.log(`User's avatar is updated with id ${info.lastInsertRowid}.`)

  return {
    id: info.lastInsertRowid,
  }
}

const getPhoto = async (_) => {
  try {
    const cmd = `SELECT * FROM personal ORDER BY id DESC LIMIT 1;`
    const stmt = database.prepare(cmd)

    const result = stmt.all()[0]

    return result
  } catch (error) {
    return null
  }
}

export { getPhoto, uploadPhoto }
