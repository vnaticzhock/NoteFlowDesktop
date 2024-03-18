// TODO
import { MessageContent, HistoryState } from '../../types/extendWindow/chat'
import database from '../sqlite.js'

const ensureChatExists = (id: string): void => {
  const createTableStmt = `
    CREATE TABLE IF NOT EXISTS chat_${id} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT,
      content TEXT
    );
  `

  database.exec(createTableStmt)
}

const transferId = (messageId: string) => {
  return messageId.replaceAll('-', '_')
}

const fetchMessages = (messageId: string, limit: number) => {
  messageId = transferId(messageId)
  ensureChatExists(messageId)

  const stmt = database.prepare(
    `SELECT * FROM chat_${messageId} ORDER BY id DESC LIMIT ?`
  )

  const result: MessageContent[] = stmt.all(limit * 2)

  return result.reverse()
}

const storeMessages = (messages: MessageContent[], messageId: string): void => {
  messageId = transferId(messageId)
  ensureChatExists(messageId)

  for (const message of messages) {
    const { role, content } = message
    const cmd = `INSERT INTO chat_${messageId} (role, content) VALUES (?, ?)`

    const stmt = database.prepare(cmd)
    stmt.run(role, content)
  }
}

const ensureHistoryExists = (): void => {
  const createTableStmt = `
    CREATE TABLE IF NOT EXISTS histories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      messageId Text,
      name TEXT,
      model TEXT,
      update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  database.exec(createTableStmt)
}

type HistoryStorage = {
  id: number
  messageId: string
  name: string
  model: string
  update_time: Date
}

const insertNewHistory = (
  _,
  messageId: string,
  name: string,
  model: string
): void => {
  ensureHistoryExists()

  const stmt = database.prepare(
    'INSERT INTO histories (messageId, name, model, update_time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
  )

  const info = stmt.run(messageId, name, model)

  console.log(
    `Chat history with id ${info.lastInsertRowid} content was successfully inserted.`
  )
}

const updateHistory = (_, messageId: string, name: string): void => {
  ensureHistoryExists()

  const stmt = database.prepare(
    'UPDATE histories SET name = ?, update_time = CURRENT_TIMESTAMP WHERE messageId = ?'
  )

  const info = stmt.run(name, messageId)

  console.log(`Chat history with id ${info} content was successfully updated.`)
}

const fetchHistories = (): HistoryState[] => {
  ensureHistoryExists()

  try {
    const stmt = database.prepare(
      'SELECT * FROM histories ORDER BY update_time DESC LIMIT 10'
    )

    const info: HistoryStorage[] = stmt.all()

    return info.map(each => {
      const { messageId, name, model } = each

      return {
        id: messageId,
        name,
        model: model
      }
    })
  } catch (error) {
    return []
  }
}

export {
  fetchMessages,
  storeMessages,
  insertNewHistory,
  updateHistory,
  fetchHistories
}
