import { DEFAULT_HTTP_HEADERS, fetchUrl, loadFile } from "../../utils";
import { DangdangConfig, parseListHtml, parseBookHtml } from "../dangdang";
import axios from "axios";
import iconv from "iconv-lite";

describe("dangdang", () => {
  it("http get", async () => {
    const res = await fetchUrl(`${DangdangConfig.siteUrl}/${DangdangConfig.categories[0].href}`);
    expect(res.status).toBe(200);
    // expect(res.data.)
  });

  describe("book page encoding", () => {
    describe("GBK", () => {
      const url = "http://product.dangdang.com/27931896.html";
      it("fetch without convert", async () => {
        const res = await fetchUrl(url);
        console.log(res.data);
      });
      it("fetch with convert", async () => {
        const ax = axios.create({ headers: DEFAULT_HTTP_HEADERS });
        const res = await ax.get(url, { responseType: "arraybuffer" });
        expect(res.headers["content-type"].includes("charset=GBK")).toBe(true);

        const data = iconv.decode(res.data, "gbk");
        console.log(data);
      });
    });
    describe("gb2312", () => {
      const url = "http://category.dangdang.com/cp01.38.07.00.00.00.html";
      it("fetch without convert", async () => {
        const res = await fetchUrl(url);
        console.log(res.data);
      });
      it("fetch with convert", async () => {
        const ax = axios.create({ headers: DEFAULT_HTTP_HEADERS });
        const res = await ax.get(url, { responseType: "arraybuffer" });
        expect(res.headers["content-type"].includes("charset=2312")).toBe(true);

        const data = iconv.decode(res.data, "gb2321");
        console.log(data);
      });
    });
  });

  it("list-first", () => {
    const html = loadFile(__dirname, "./example-pages/list-first.html");

    const { bookUrls, nextListUrl } = parseListHtml(html);
    expect(Array.isArray(bookUrls)).toBe(true);
    expect(bookUrls.length).toBe(60);

    const firstBookUrl = bookUrls[0];
    expect(firstBookUrl).toBe("http://product.dangdang.com/28970991.html");

    expect(nextListUrl).toBe(encodeURI("http://category.dangdang.com/pg2-cp01.38.07.00.00.00.html"));
  });

  it("isbn", () => {
    const reg = /\d{9,}/g;
    const text = "国际标准书号ISBN：9787502571832所属分类：图书>传记>女性人物";

    const regResult = reg.exec(text);
    expect(regResult).toBeTruthy();

    if (regResult) {
      expect(regResult[0]).toBe("9787502571832");
    }
  });

  it("book-30877190", () => {
    const html = loadFile(__dirname, "./example-pages/book-1585787597.html");

    const { title, isbn, rating } = parseBookHtml(html);
    console.log(title, isbn, rating);

    expect(title.startsWith("林徽因传")).toBe(true);
    expect(isbn).toBe("9787502571832");
  });
});
