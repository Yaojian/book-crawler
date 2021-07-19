import path from "path";

export interface IBookInfo {
  isbn: string;
  title: string;
  rating?: string;
  props?: string[];
}

export interface IBook extends IBookInfo {
  url: string;
}

export const jsonOutputPath = path.join(process.cwd(), "/books.json");
export const xlOutputPath = path.join(process.cwd(), "/books.xlsx");
