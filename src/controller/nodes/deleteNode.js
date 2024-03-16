import database from "../sqlite.js";

const deleteNode = (_, id) => {
  const stmt = database.prepare("DELETE FROM nodes WHERE id = ?");

  stmt.run(id);

  console.log(`Node with id ${id} was successfully deleted.`);
};

export default deleteNode;
