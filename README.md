# book-crawler

书籍爬虫。

## 安装

```
pnpm install
pnpm run build
```

## 运行

```
node dist/index.js <网站> <子命令> [参数]
```

* 网站可以为 "douban" 或 "dangdang".
* 子命令指明对网站采取的动作, 可以为:
  * `urls`, 仅爬取书籍列表页, 并将链接列表保存在 `--urls-file [urlsFile]` 指定的文件中, 默认为 `book-urls.json`
  * `books`, 仅爬取书籍详情, 并书籍信息保存在 `--books-file [booksFile]` 指定的文件中, 默认为 `books.json`
    * 当单独执行此动作时, 需要设置 `--urls-file` 以指定书籍链接的列表文件, 未设置时采用默认值
  * `xlsx`, 仅生成 excel 格式的书籍列表, 保存在 `--xlsx-file [xlsxFile]` 指定的文件中, 默认为 `books.xlsx`
    * 当单独执行此动作时, 需要设置 `--books-file` 以指定被转换的书籍详情文件, 未设置时采用默认值
  * **`run`**, 按顺序执行以上三者.
* 参数
  * 文件名参数，用于控制每个步骤作为输出或输入的文件名
    * `-uf [urlsFile]` 或 `--urls-file [urlsFile]`  json 格式的书籍链接文件. (default: "book-urls.json")
    * `-bf [booksFile]` 或 `--books-file [booksFile]`  json 格式的书籍信息文件. (default: "books.json")     
    * `-xf [xlsxFile]` 或 `--xlsx-file [xlsxFile]`    Excel 格式的书籍信息文件. (default: "books.xlsx")
  * `-s` 或 `--sampling <limit>`, 设定采样数量. 该参数主要用于调试, 每个步骤仅处理最多 `limit` 个数据.  
    
:bulb: 分步执行动作可以降低网络故障带来的时间损失

### 样例

采用默认参数爬取豆瓣网:
```
  node dist/index.js douban run
```

对当当网以采样方式运行整个过程:
```
  node dist/index.js dangdang run -s 2
```

爬取 douban 的书籍列表页, 并将结果保存在 `douban-urls.json`:
```
  node dist/index.js douban urls --urls-file douban-urls.json
```

从 `douban-urls.json` 中加载书籍详情页的链接，爬取书籍详情页，并将书籍详情保存在 `douban-books.json` 中:
```
  node dist/index.js douban books --urls-file douban-urls.json --books-file douban-books.json
```

从 `douban-books.json` 中加载书籍信息, 生成 excel 格式的 `douban-books.xlsx`:
```
  node dist/index.js douban xlsx --books-file douban-books.json --xlsx-file douban-books.xlsx
```

## 实现

* `index.ts` 为整个系统的入口
* `cmd-args.ts` 使用 [`commander`](https://github.com/tj/commander.js) 解析命令行参数
* `core.ts` 的 `executeCore` 函数提供了主控流程
* `douban/douban.ts` 与 `dangdang/dangdang.ts` 均提供一个 `execute` 函数, 用于执行对应站点的动作

### pkg 打包

`package.json` 的 `bin`/`pkg` 元素设定了 [pkg](https://github.com/vercel/pkg) 打包的参数.
在项目目录运行 `./node_modules/.bin/pkg` 默认生成 `./bin/book-crawler.exe`
