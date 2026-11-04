# 灵感小作 · Little Creations

一些有趣、好看、可以动手玩的网页创作。不要求每件作品都成为完整产品，把偶然的灵感做出来就很好。

**[打开合集，开始玩 ↗](https://sasafreya.github.io/little-creations/)**

## 作品

### 001 · 莲 · 岁时

![粉色荷花](lotus-calendar/assets/lotus.png)

一朵荷花，一整年的日子。海报式全年日历，支持年份切换、日期小记，以及通过浏览器打印保存为 PDF。

[在线体验](https://sasafreya.github.io/little-creations/lotus-calendar/) · [源码](lotus-calendar/)

## 关于个人记录

日历小记仅通过 `localStorage` 保存在访问者当前浏览器中，代码没有将小记上传到 GitHub 或服务器的逻辑。本仓库只包含网页源码和静态图片，不含个人日记或小记数据。

不同浏览器、设备和站点地址的记录相互独立。旧私有网站中的小记不会自动迁移到 GitHub Pages；清理浏览器站点数据也会清除小记。

## 本地运行

在仓库目录运行 `python3 -m http.server 8000`，然后访问 `http://localhost:8000`。

## 添加下一件作品

每件作品使用独立目录，并在首页与本 README 中加入入口。尽量保持静态网页、无需登录、打开就能玩。

## 素材说明

荷花底图由 OpenAI 内置图像生成工具生成，提示主题为「暖纸色背景上的巨幅粉色荷花、半透明花瓣与植物纹理、复古植物海报质感、无文字」。

## 合集首页视觉

首页使用无字蓝色蜡笔花鸟画布，预留手写标题区域；荷花照片卡片是日历入口。后续可在 `index.html` 的 `.handwriting-space` 内加入透明背景的手写图片。

蓝色底图：`assets/blue-meadow.png`，由 OpenAI 内置图像生成工具生成，提示主题为「蓝色织纹纸上的蜡笔小花与白色飞鸟，上方留白，不含文字、署名或页码」。
