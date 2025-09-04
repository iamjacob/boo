import { client } from "../lib/meilisearchClient.js";

async function init() {
  try {
    await client.createIndex("books", { primaryKey: "id" });
    console.log("Index 'books' created!");
  } catch (err) {
    if (err.code === "index_already_exists") {
      console.log("Index already exists.");
    } else {
      console.error(err);
    }
  }
}

init();
