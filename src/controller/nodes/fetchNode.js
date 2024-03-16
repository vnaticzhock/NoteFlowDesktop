import database from "../sqlite.js";
import {fetchIsFavorite} from "./favorites.js";

const fetchNode = (_, nodeId) => {
  try {
    const stmt = database.prepare("SELECT * FROM nodes WHERE id = ?");
    const flow = stmt.all(nodeId)[0];

    return {
      ...flow,
      favorite: fetchIsFavorite(_, nodeId),
    };
  } catch (error) {
    return null;
  }
};

export default fetchNode;
