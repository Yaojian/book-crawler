import cheerio from "cheerio";
import * as Path from "path";
import { DOUBAN_ListFirstUri, DOUBAN_ListPage_BookList, DOUBAN_ListPage_Next, parseListPage } from "../douban";
import { DEFAULT_HTTP_HEADERS, loadHtmlFile } from "../../utils";
import axios from "axios";

const bookDetailsFile = Path.join(__dirname, "./example-pages/book-details.html");

describe("douban", () => {
  it("http get", async () => {
    const res = await axios.get<string>(DOUBAN_ListFirstUri, {
      headers: DEFAULT_HTTP_HEADERS,
    });
    expect(res.status).toBe(200);
  });

  it("list-first", () => {
    const html = loadHtmlFile(__dirname, "./example-pages/list-first.html");

    const { bookInfos, nextListPageUri } = parseListPage(html);
    expect(Array.isArray(bookInfos)).toBe(true);
    expect(bookInfos.length).toBe(20);

    const bookItem = bookInfos[0];
    expect(bookItem.uri).toBe("https://book.douban.com/subject/30877190/");
    expect(bookItem.title).toBe("陈延年：站着从容就义");

    expect(nextListPageUri).toBe("/tag/人物传记?start=20&type=T");
  });

  it("list-empty", () => {
    const html = loadHtmlFile(__dirname, "./example-pages/list-empty.html");

    const $ = cheerio.load(html);

    const $bookItems = $(DOUBAN_ListPage_BookList);
    expect($bookItems.length).toBe(0);

    const $nextLink = $(DOUBAN_ListPage_Next);
    expect($nextLink.length).toBe(0);

    const { bookInfos, nextListPageUri } = parseListPage(html);
    expect(Array.isArray(bookInfos)).toBe(true);
    expect(bookInfos.length).toBe(0);

    expect(nextListPageUri).toBe("");
  });
});
