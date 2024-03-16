import Database from "better-sqlite3";

const database = new Database("./database.db", {verbose: console.log});

export default database;
