export interface ICategory {
  readonly name: string;
  readonly href: string;
}

const categories: ReadonlyArray<ICategory> = [
  { name: "科学家", href: "cp01.38.16.00.00.00.html" },
  { name: "女性人物", href: "cp01.38.07.00.00.00.html" },
  { name: "财经人物", href: "cp01.38.01.00.00.00.html" },
  { name: "历代帝王", href: "cp01.38.02.00.00.00.html" },
  { name: "历史人物", href: "cp01.38.06.00.00.00.html" },
  { name: "政治人物", href: "cp01.38.05.00.00.00.html" },
  { name: "领袖首脑", href: "cp01.38.03.00.00.00.html" },
  { name: "自传", href: "cp01.38.25.00.00.00.html" },
  { name: "军事人物", href: "cp01.38.04.00.00.00.html" },
  { name: "国学大师", href: "cp01.38.17.00.00.00.html" },
  { name: "体育明星", href: "cp01.38.19.00.00.00.html" },
  { name: "艺术家", href: "cp01.38.15.00.00.00.html" },
  { name: "文学家", href: "cp01.38.14.00.00.00.html" },
  { name: "人物合集", href: "cp01.38.21.00.00.00.html" },
  { name: "影视明星", href: "cp01.38.18.00.00.00.html" },
  { name: "哲学家", href: "cp01.38.10.00.00.00.html" },
  { name: "学者", href: "cp01.38.27.00.00.00.html" },
  { name: "宗教人物", href: "cp01.38.09.00.00.00.html" },
  { name: "画传", href: "cp01.38.26.00.00.00.html" },
  { name: "教育家", href: "cp01.38.12.00.00.00.html" },
  { name: "人文/社会学家", href: "cp01.38.11.00.00.00.html" },
  { name: "法律人物", href: "cp01.38.08.00.00.00.html" },
  { name: "语言文字学家", href: "cp01.38.13.00.00.00.html" },
  { name: "其他人物传记", href: "cp01.38.28.00.00.00.html" },
  { name: "建筑设计师", href: "cp01.38.91.00.00.00.html" },
  { name: "家族研究/谱系", href: "cp01.38.23.00.00.00.html" },
  { name: "年谱", href: "cp01.38.24.00.00.00.html" },
  { name: "传记的研究与编写", href: "cp01.38.22.00.00.00.html" },
];

const siteUrl = "http://category.dangdang.com";

/** 页面元素选择器. */
const selectors = Object.freeze({
  /** 列表页的选择器. */
  listPage: Object.freeze({
    /** 获取书籍列表, 返回一个数组, 每个元素代表一本书.*/
    books: ".bigimg > li> p.name > a",
    /** 从列表页获取 “后页”, 形如：<a href="/pg3-cp01.38.07.00.00.00.html" title="下一页">下一页</a> */
    next: ".paging > ul> li.next > a",
  }),
  /** 详情页的选择器. */
  detailPage: Object.freeze({
    title: "#product_info > div.name_info > h1",
    info: "#detail_describe > ul",
    rating: "#comment_percent",
    isbn: "#detail_describe > ul >li",
  }),
});

export const configs = {
  categories,
  siteUrl,
  selectors,
};
