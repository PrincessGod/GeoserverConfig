# GeoServer 配置

这里有一些关于GeoServer配置的[文章](http://princessgod.github.io/GeoserverConfig/)。

## 如何修改错误或补充内容

1. Fork 这个仓库
2. 查看[如何在本地运行](#如何在本地运行)
3. 修改所需内容
4. 提交 Pull Request

或者直接在 issue 中提出意见或建议。

## 如何在本地运行

* 使用 `git clone` 或下载压缩文件，将项目下载到本地
* 确保已经安装[Node.js](https://nodejs.org/en/)
* 在终端运行

```
npm install
```
    
如果使用非Windows系统，可能需要在行头加上`sudo`。

如果需要编译项目

    gulp
    
编译结果在`./build`目录下，源文件在`./src`目录下

如果需要做修改，并启用live-reload

    gulp watch
    
键盘组合键`Ctrl+C`停止服务。
