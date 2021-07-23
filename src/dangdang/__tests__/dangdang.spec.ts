import axios from "axios";
import fs from "fs";
import iconv from "iconv-lite";
import path from "path";
import { DEFAULT_HTTP_HEADERS, loadFile } from "../../utils";
import { parseBookPage, parseListPage } from "../dangdang";

describe("dangdang", () => {
  describe("list pages", () => {
    const url = "http://category.dangdang.com/cp01.38.07.00.00.00.html";

    it("is encoded in gb2312", async () => {
      const ax = axios.create({ headers: DEFAULT_HTTP_HEADERS });
      const res = await ax.get(url, { responseType: "arraybuffer" });
      expect(res.headers["content-type"].includes("charset=gb2312")).toBe(true);
    });

    it("parseListPage", () => {
      const html = loadFile(__dirname, "./example-pages/list-first.html");

      const { bookUrls, nextUrl } = parseListPage(html);
      expect(Array.isArray(bookUrls)).toBe(true);
      expect(bookUrls.length).toBe(60);

      const firstBookUrl = bookUrls[0];
      expect(firstBookUrl).toBe("http://product.dangdang.com/28970991.html");

      expect(nextUrl).toBe(encodeURI("http://category.dangdang.com/pg2-cp01.38.07.00.00.00.html"));
    });
  });
  describe("book pages", () => {
    const url = "http://product.dangdang.com/27931896.html";

    it("is encoded in GBK", async () => {
      const ax = axios.create({ headers: DEFAULT_HTTP_HEADERS });
      const res = await ax.get(url, { responseType: "arraybuffer" });
      expect(res.headers["content-type"].includes("charset=GBK")).toBe(true);
    });

    it("parse ISBN", () => {
      const reg = /\d{9,}/g;

      validate("国际标准书号ISBN：9787502571832所属分类：图书>传记>女性人物", "9787502571832");
      validate("\n 国际标准书\n 号ISBN：9787502571832所属分类：图书>传记>女性\r\n人物\n", "9787502571832");

      function validate(text: string, expectedISBN: string) {
        const matched = text.match(reg);
        expect(matched).toBeTruthy();
        if (matched) {
          expect(matched.length > 0).toBe(true);
          expect(matched[0]).toBe(expectedISBN);
        }
      }
    });

    it("parseBookPage book-1585787597.html", () => {
      const html = loadGbkAsUtf8(path.join(__dirname, "./example-pages/book-1585787597.html"));

      const { title, isbn, rating } = parseBookPage(html);
      console.log(title, isbn, rating);

      expect(title.startsWith("林徽因传")).toBe(true);
      expect(isbn).toBe("9787502571832");
    });
  });
});

function loadGbkAsUtf8(f: string) {
  const buf: Buffer = fs.readFileSync(f);
  return iconv.decode(buf, "gbk");
}
