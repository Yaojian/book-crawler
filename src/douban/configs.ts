const siteUrl = "http://book.douban.com";

/** 第一个列表页 URI*/
const firstListUrl = "http://book.douban.com/tag/%E4%BA%BA%E7%89%A9%E4%BC%A0%E8%AE%B0?start=0";

/** 页面元素选择器. */
const selectors = Object.freeze({
  /** 列表页的选择器. */
  listPage: Object.freeze({
    /** 获取书籍列表, 返回一个数组, 每个元素代表一本书.*/
    books: "#subject_list .subject-item .info h2 a",
    /** 从列表页获取 “后页”, 形如：<a href="/tag/人物传记?start=20&type=T">后页</a> */
    next: "#subject_list > div.paginator > span.next > a",
  }),
  detailPage: Object.freeze({
    title: "#wrapper > h1 > span",
    info: "#info",
    rating: "#interest_sectl > div > div.rating_self.clearfix > strong",
  }),
});

export const configs = {
  siteUrl,
  firstListUrl,
  selectors,
};
