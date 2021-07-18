import axios from "axios";
import cheerio from "cheerio";
import { IBookInfo } from "../common";
import { DEFAULT_HTTP_HEADERS } from "../utils";

export const DOUBAN_SiteUri = "http://book.douban.com";

/** 第一个列表页 URI*/
export const DOUBAN_ListFirstUri = `${DOUBAN_SiteUri}/tag/%E4%BA%BA%E7%89%A9%E4%BC%A0%E8%AE%B0?start=0`;
/**
 * 从列表页获取列表项，每个列表项代表一本书。返回一个数组，每个元素形如：
 * <a href="https://book.douban.com/subject/30877190/" title="陈延年：站着从容就义">陈延年：站着从容就义</a>
 * */
export const DOUBAN_ListPage_BookList = "#subject_list .subject-item .info h2 a";
/**
 * 从列表页获取 “后页”, 形如：
 * <a href="/tag/人物传记?start=20&type=T">后页&</a>
 * */
export const DOUBAN_ListPage_Next = "#subject_list > div.paginator > span.next > a";

interface IBookListPageResult {
  bookInfos: IBookInfo[];
  nextListPageUri: string | undefined;
}

export async function processDoubanSite() {
  let uri: string | undefined = DOUBAN_ListFirstUri;

  const allBookInfos: IBookInfo[] = [];
  while (uri) {
    console.log(`processing list: ${uri}`);
    const listPageResult: IBookListPageResult = await processListPage(uri);
    const { bookInfos, nextListPageUri } = listPageResult;

    allBookInfos.push(...bookInfos);
    uri = nextListPageUri !== uri ? nextListPageUri : undefined;
  }

  console.log(`Total ${allBookInfos.length} books.`);
}

async function processListPage(uri: string): Promise<IBookListPageResult> {
  let res = await axios.get<string>(uri, {
    headers: DEFAULT_HTTP_HEADERS,
  });
  return parseListPage(res.data);
}

export function parseListPage(html: string): IBookListPageResult {
  const $ = cheerio.load(html);

  // 处理列表项
  const $bookItem = $(DOUBAN_ListPage_BookList);
  const bookInfos: IBookInfo[] = [];
  $bookItem.each((index, el: any) => {
    const bookInfo = { uri: el.attribs["href"], title: el.attribs["title"] };
    bookInfos.push(bookInfo);
  });

  // 处理"后页"
  const $nextLink = $(DOUBAN_ListPage_Next);
  const href = $nextLink?.attr("href") ?? ""; //  such as `/tag/人物传记?start=20&amp;type=T`;
  const nextListPageUri = concatUri(href);

  return { bookInfos, nextListPageUri };
}

function concatUri(pathComponent: string | undefined): string | undefined {
  if (!pathComponent) return undefined;
  return encodeURI(DOUBAN_SiteUri + pathComponent);
}
