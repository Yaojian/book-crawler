import { IBook } from "./common";
import * as xl from "exceljs";

export async function xlWriteBooks(books: IBook[], fileName: string) {
  const xlWorkbook = new xl.Workbook();
  const xlSheet = xlWorkbook.addWorksheet("books");

  for (let i = 1; i <= books.length; i++) {
    const book = books[i];
    if (!book) continue;

    const row = xlSheet.getRow(i);

    row.getCell(1).value = book.isbn;
    row.getCell(2).value = book.title;
    row.getCell(3).value = book.rating;
    row.getCell(4).value = book.url;

    row.getCell(5).value = book.props?.join("\r\n");
    row.getCell(5).alignment = { wrapText: true };
  }

  await xlWorkbook.xlsx.writeFile(fileName);
}
