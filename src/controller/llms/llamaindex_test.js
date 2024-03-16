import fs from "fs";
import {Document, VectorStoreIndex} from "llamaindex";

const path = "/Users/yohowang/Downloads/r11725057_cv_0223(1).pdf";

const essay = await fs.readFile(path, "utf-8");

const document = new Document({text: essay, id_: path});

const index = await VectorStoreIndex.fromDocuments([document]);

const queryEngine = index.asQueryEngine();

const response = await queryEngine.query({
  query: "What did the author do in college?",
});
