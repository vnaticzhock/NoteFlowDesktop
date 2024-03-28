import database from '../sqlite.js';
const ensureChatExists = (id) => {
    const createTableStmt = `
    CREATE TABLE IF NOT EXISTS chat_${id} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT,
      content TEXT
    );
  `;
    database.exec(createTableStmt);
};
const transferId = (messageId) => {
    return messageId.replaceAll('-', '_');
};
const fetchMessages = (_, id, limit) => {
    ensureChatExists(id);
    const stmt = database.prepare(`SELECT * FROM chat_${id} ORDER BY id DESC LIMIT ?`);
    const result = stmt.all(limit * 2);
    return result.reverse();
};
const storeMessages = (messages, id) => {
    ensureChatExists(id);
    for (const message of messages) {
        const { role, content } = message;
        const cmd = `INSERT INTO chat_${id} (role, content) VALUES (?, ?)`;
        const stmt = database.prepare(cmd);
        stmt.run(role, content);
    }
};
const ensureHistoryExists = () => {
    const createTableStmt = `
    CREATE TABLE IF NOT EXISTS histories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parentMessageId Text,
      name TEXT,
      model TEXT,
      update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    database.exec(createTableStmt);
};
const insertNewHistory = (_, parentMessageId, name, model) => {
    ensureHistoryExists();
    const stmt = database.prepare('INSERT INTO histories (parentMessageId, name, model, update_time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)');
    const info = stmt.run(parentMessageId, name, model);
    console.log(`Chat history with id ${info.lastInsertRowid} content was successfully inserted.`);
    return info.lastInsertRowid;
};
const updateHistory = (_, id, parentMessageId, name) => {
    ensureHistoryExists();
    const stmt = database.prepare('UPDATE histories SET parentMessageId = ?, name = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?');
    const info = stmt.run(parentMessageId, name, id);
    console.log(`Chat history with id ${info} content was successfully updated.`);
};
const fetchHistories = () => {
    ensureHistoryExists();
    try {
        const stmt = database.prepare('SELECT * FROM histories ORDER BY update_time DESC LIMIT 10');
        const info = stmt.all();
        return info;
    }
    catch (error) {
        return [];
    }
};
export { fetchMessages, storeMessages, insertNewHistory, updateHistory, fetchHistories };
