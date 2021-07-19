import fs from "fs";
import { xlOutputPath } from "./common";
import { xlWriteBooks } from "./transforms";

export function xlTransformBooks() {
  const rawBooks = fs.readFileSync("books.json", "utf-8");
  const books = JSON.parse(rawBooks);
  xlWriteBooks(books, xlOutputPath).catch((e) => {
    console.log(e);
  });
}

xlTransformBooks();
