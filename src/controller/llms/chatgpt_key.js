import database from "../sqlite.js";

const ensureTableExists = () => {
  const createTableStmt = `
        CREATE TABLE IF NOT EXISTS chatgpt_api_keys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT
        );
      `;
  database.exec(createTableStmt);

  const createTableStmt2 = `
        CREATE TABLE IF NOT EXISTS chatgpt_api_keys_default (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT
        );
      `;
  database.exec(createTableStmt2);
};

const getApiKeys = () => {
  ensureTableExists();

  const stmt = database.prepare("SELECT * FROM chatgpt_api_keys");
  const info = stmt.all();

  return {
    keys: info.map(each => each.key),
    default: getDefaultApiKey(),
  };
};

const getDefaultApiKey = () => {
  const stmt = database.prepare("SELECT * FROM chatgpt_api_keys_default");
  const info = stmt.all();

  return info.length !== 0 ? info[0].key : undefined;
};

const addApiKey = (_, key) => {
  ensureTableExists();

  const stmt = database.prepare(
    "INSERT INTO chatgpt_api_keys (key) VALUES  (?)",
  );

  const info = stmt.run(key);

  console.log(
    `A new api key was successfully added with id ${info.lastInsertRowid}.`,
  );

  return {
    id: info.lastInsertRowid,
  };
};

const updateDefaultApiKey = (_, key) => {
  ensureTableExists();

  const existingRecord = database
    .prepare("SELECT * FROM chatgpt_api_keys_default LIMIT 1")
    .get();

  if (existingRecord) {
    database
      .prepare("UPDATE chatgpt_api_keys_default SET key = ? WHERE id = 1")
      .run(key);
  } else {
    database
      .prepare("INSERT INTO chatgpt_api_keys_default (key) VALUES (?)")
      .run(key);
  }

  console.log("Default api key was successfully updated.");
};

const removeApiKey = (_, key) => {
  const stmt = database.prepare("DELETE FROM chatgpt_api_keys WHERE key = ?");

  stmt.run(key);

  console.log("Api key specified was successfully removed.");
};

export {
  addApiKey,
  getApiKeys,
  getDefaultApiKey,
  removeApiKey,
  updateDefaultApiKey,
};
