# 环境优化

此文介绍关于GeoServer的优化部分，主要分为 JVM 和 GerServer 两部分。

## JVM 相关优化

### 安装JAI扩展
[Java Advanced Imaging API](http://www.oracle.com/technetwork/java/javase/tech/jai-142803.html)
(JAI)是一个甲骨文提供的图像处理库，GeoServer需要使用它生成WMS瓦片影像，
JAI的性能对所有栅格化处理都很重要，尤其是WMS和WCS中缩放，裁剪，重构光栅内容等部分。

[Java Image I/O Technology](http://docs.oracle.com/javase/6/docs/technotes/guides/imageio/index.html)
用于栅格文件的读写，主要使用在WMS和WCS的栅格图像读取部分，对WMS的输出影响也很大，因为输出的编码格式要求为PNG/GIF/JPEG图像。

GeoServer默认包含一个“纯Java”版本的JAI，但是处于性能考虑，
可以将JAI和ImageIO作为“Java 扩展”安装在你的JDK/JRE上。

目前JAI在Windows上只有32位版本，具体安装细节可以到[官网](http://docs.geoserver.org/latest/en/user/production/java.html)查看。

### JVM 参数调整
主要对JVM容器进行调整，根据需求和硬件选择合适的环境配置。

| 参数 | 含义 | 默认值 | 描述 |
| --- | --- | ----- | ---- |
| `-Xms128m` | JVM初始堆大小 | 物理内存的 1/64 | 这里`Xms128m`表示在JVM初始化时获取128M内存。当可用堆大小小于40%时会增大到`-Xmx`最大限制。 |
| `-Xmx756M` | 最大堆大小 | 物理内存的 1/4 | 默认(MaxHeapFreeRatio参数可以调整)空余堆内存大于70%时，JVM会减少堆直到`-Xms`的最小限制。 |
| `-XX:SoftRefLRUPolicyMSPerMB=36000` | 每兆堆空闲空间中SoftReference的存活时间 | 1s | GeoServer使用SoftReference缓存数据，将这个值增加到`36000`（也就是 36s）有助于提高缓冲的效率 |
| `-XX:+UseParallelGC` | 使用并行垃圾收集器 | | 默认的垃圾收集器，在使用一些线程回收内存时暂停应用。如果是轻量级的使用，并且垃圾可以容忍暂停就可以使用该项。 |
| `-XX:+UseParNewGC` | 设置年轻带使用并行收集器 | | 启用CMS(Concurrent mark sweep)，在程序运行时使用多线程回收内存，在服务器持续使用时推荐此项，堆大小至少为 6GB。 |

更多关于垃圾回收的参数设置可以阅读文章[Tuning Garbage Collection Outline](http://www.petefreitag.com/articles/gctuning/)
和[The 4 Java Garbage Collectors](http://blog.takipi.com/garbage-collectors-serial-vs-parallel-vs-cms-vs-the-g1-and-whats-new-in-java-8/)。

### 启用 Marlin 光栅化
在 Java 8 中使用 Marlin 光栅化，可以提升渲染矢量数据的性能。

使用以下代码可以在 JVM 启动时启用 Marlin 光栅化。

## GeoServer 相关优化

### 选择合适的服务策略（Service Strategy）
服务策略就是服务器向客户端提供输出的方法，需要在正确的形式（确保报告合适的错误信息之类）和速度
（最快化服务输出能力）之前进行权衡。你可以通过编辑GeoServer实例的`web.xml`文件修改服务策略。

| 策略 | 描述 |
| --- | --- |
| `SPEED` | 以最快速度输出，省略OGC错误报告 |
| `BUFFER` | 将所有的结果先存储在内存中，等输出都完成后再传送这些数据，这样可以确保报告OGC错误，但会稍有延迟，如果请求量大的时候，会迅速消耗完内存。 |
| `FILE` | 和 `BUFFER` 相似，但是将结果存储在文件中而不是内存中，可以避免内存错误，但同时会慢一些。|
| `PARTIAL-BUFFER` | 介于`FILE`和`BUFFER`之间，这种方式在内存中使用几KB用于响应请求，然后提供所有输出服务。 |

### 自定义服务
为了让GeoServer更有用，最好制定自己的服务元数据。

例如
* 填写WMS，WFS和WCS的内容部分，也可以关闭不需要使用的服务。
* 将数据服务放在自己的名称空间中（当然也要提供正确的服务地址）。
* 移除不需要的图层，比如默认图层`topp:states`等。

### 调整服务限制
不要让客户端从服务器请求过量的数据。

例如
* 设置WFS的GetFeature请求的最大要素数。
* 设置WMS的`request limits`确保请求不会占用太多内存或者请求次数过多。

## 相关链接

* [构建高效的运行环境](http://docs.geoserver.org/latest/en/user/production/index.html)
