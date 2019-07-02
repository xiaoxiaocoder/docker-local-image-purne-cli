# DOCKER-LOCAL-IMAGE-PURNE

清理本地Docker镜像, 以避免占用空间

## 依赖项(需确保使用前, 已安装以下两个依赖项, 并完成初始化操作)

- [harbor-cli](https://www.npmjs.com/package/harbor-cli)
- [docker-cli-js](https://www.npmjs.com/package/docker-cli-js)

### 配置项

可以增加在`nci.json`中增加配置项`deletLocalImageOverDays(数字类型)`, 表示为`当前时间-镜像构建时间`超过该时间阈值, 会删除已过期镜像.
