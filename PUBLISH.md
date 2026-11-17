# 发布清单（GitHub + npm + dshmarket）

远程仓库：**https://github.com/xutao0325/dsh-appearance-suite**

## 1. 推送到 GitHub

```bash
cd dsh-appearance-suite
git init
git add .
git commit -m "chore: publish-ready dsh-appearance-suite v1.0.9"
git remote add origin https://github.com/xutao0325/dsh-appearance-suite.git
# 若在 GitHub 先建了空仓库且默认分支为 main：
git push -u origin main
```

- 给仓库加 Topic：**`dsh-plugin`**（GitHub → About → Topics）
- 仓库创建满 **1 天** 后再向 awesome-dsh-plugin 提 PR（CI 年龄门槛）

## 2. 发布 npm

包名：**`dsh-appearance-suite`**（无 scope）。

```bash
cd dsh-appearance-suite
npm pack
npm login
npm publish --access public
```

安装（桌面 profile）：

```bash
dsh plugin --profile desktop add dsh-appearance-suite
```

从本机 `link:` 迁移时先 remove 旧 `@local/...`（若仍存在），再 add 上面包名并**重启 Harness**。

## 3. 进 dshmarket（awesome 目录）

向 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 提 PR，新增文件：

`data/plugins/xutao0325__dsh-appearance-suite.yml`

内容见 [publish/awesome-dsh-plugin-entry.yml](./publish/awesome-dsh-plugin-entry.yml)（已填好 GitHub 地址与 raw icon）。

## 4. 发布前自检

```bash
node tests/appearance-pure.test.mjs
npm pack && tar -tzf dsh-appearance-suite-*.tgz | head
```

## 5. 可选加分

- `screenshots.json` + 2～3 张界面截图（市场详情页）
