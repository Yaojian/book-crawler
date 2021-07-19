import cheerio from "cheerio";
import * as Path from "path";
import { DoubanConfig, parseBookHtml, parseListHtml } from "../douban";
import { fetchUrl, loadFile } from "../../utils";

const bookDetailsFile = Path.join(__dirname, "./example-pages/book-details.html");

describe("douban", () => {
  it("http get", async () => {
    const res = await fetchUrl(DoubanConfig.firstListUrl);
    expect(res.status).toBe(200);
  });

  it("list-first", () => {
    const html = loadFile(__dirname, "./example-pages/list-first.html");

    const { bookUrls, nextListUrl } = parseListHtml(html);
    expect(Array.isArray(bookUrls)).toBe(true);
    expect(bookUrls.length).toBe(20);

    const firstBookUrl = bookUrls[0];
    expect(firstBookUrl).toBe("https://book.douban.com/subject/30877190/");

    expect(nextListUrl).toBe(encodeURI("http://book.douban.com/tag/人物传记?start=20&type=T"));
  });

  it("list-empty", () => {
    const html = loadFile(__dirname, "./example-pages/list-empty.html");

    const { bookUrls, nextListUrl } = parseListHtml(html);
    expect(Array.isArray(bookUrls)).toBe(true);
    expect(bookUrls.length).toBe(0);

    expect(nextListUrl).toBe(undefined);
  });

  describe("book", () => {
    it("book-30877190", () => {
      const html = loadFile(__dirname, "./example-pages/book-30877190.html");

      const { title, isbn, rating } = parseBookHtml(html);
      expect(title).toBe("陈延年：站着从容就义");
      expect(isbn).toBe("9787500864233");
      expect(rating).toBe("9.1");
    });

    it("book-26287433", () => {
      const html = loadFile(__dirname, "./example-pages/book-26287433.html");

      const { title, isbn, rating } = parseBookHtml(html);
      expect(title).toBe("心若菩提");
      expect(isbn).toBe("9787010142401");
      expect(rating).toBe("9.1");
    });
  });
});
