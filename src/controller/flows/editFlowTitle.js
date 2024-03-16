import database from "../sqlite.js";

const editFlowTitle = (_, id, newTitle) => {
  const stmt = database.prepare("UPDATE flows SET title = ? WHERE id = ?");

  stmt.run(newTitle, id);

  console.log(`Flow with id ${id} title was successfully updated.`);
};

export default editFlowTitle;
