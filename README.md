# 航途小岛 · Harbor & Home

一款轻松的小岛经营 PWA。岛屿位于蓝湾航线必经之路，建造出租屋，迎接客船，收租升级房屋与码头。

## 游玩

选择建筑 → 点击空地 → 等待每 20 秒一班客船 → 收取租金 → 升级建筑或扩建码头。完成任务可领取额外金币。四类建筑、五级房屋、五级小岛，共 12 块土地。

进度自动保存在浏览器，可导入和导出 JSON 存档。离线最多结算 4 小时租金。暂停仅在当前页面生效。没有账号服务、支付或广告。

## 运行与发布

无需安装依赖。运行 `python3 -m http.server 8080` 后访问 `http://localhost:8080`。也可将全部文件部署到 GitHub Pages。PWA 安装和离线缓存需要 HTTPS 或 localhost；请勿通过 file:// 打开验证。

GitHub Pages：仓库 Settings → Pages → Deploy from a branch → main / root → Save。首次联网加载后可离线打开。iPhone 在 Safari 分享菜单中“添加到主屏幕”；Android 使用浏览器安装应用。

更新缓存资源时递增 sw.js 中的 CACHE 版本。游戏使用原生 HTML/CSS/JavaScript 与内置 SVG 图形，无外部运行依赖。
