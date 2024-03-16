import database from "../sqlite.js";

const saveFlowThumbnail = (_, flowId, thumbnailBase64) => {
  // 準備更新縮圖的SQL語句
  const stmt = database.prepare("UPDATE flows SET thumbnail = ? WHERE id = ?");

  // 執行更新操作
  const info = stmt.run(thumbnailBase64, flowId);

  if (info.changes > 0) {
    console.log(
      `Thumbnail for flow with id ${flowId} was successfully updated.`,
    );
  } else {
    console.log(`No flow found with id ${flowId} to update.`);
  }
};

export default saveFlowThumbnail;
