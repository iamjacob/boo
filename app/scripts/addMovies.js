import fs from "fs";
import { client } from "../lib/meilisearchClient.js";

async function addMoovies() {
  const index = client.index("movies"); // index name

  // Read the JSON file
  const data = fs.readFileSync("public/movies.json", "utf-8");
  const movies = JSON.parse(data);

  // Add documents to Meilisearch
  const response = await index.addDocuments(movies);
  console.log("Movies added:", response);
}

addMoovies();
