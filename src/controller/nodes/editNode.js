import database from '../sqlite.js'

const editNodeTitle = (_, id, newTitle) => {
  const stmt = database.prepare(
    'UPDATE nodes SET title = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
  )

  stmt.run(newTitle, id)

  console.log(`Node with id ${id} title was successfully updated.`)
}

const editNodeContent = (_, id, newContent) => {
  const stmt = database.prepare(
    'UPDATE nodes SET content = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
  )

  stmt.run(newContent, id)

  console.log(`Node with id ${id} content was successfully updated.`)
}

export { editNodeTitle, editNodeContent }
