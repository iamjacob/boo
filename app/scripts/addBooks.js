import { client } from "../lib/meilisearchClient.js";

async function addBooks() {
  const index = client.index("books");

  const documents = [
    { id: 1, title: "1984", author: "George Orwell", genre: "Fiction" },
    { id: 2, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction" },
    { id: 3, title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-fiction" }
  ];

  const response = await index.addDocuments(documents);
  console.log("Documents added:", response);
}

addBooks();
