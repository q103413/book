# Docker快速搭建Gitbook

### 1.1. 系统环境

CentOS7系统 + Docker环境

### 1.3. GitBook容器

启动好了Docker服务之后，我们就可以拉取Gitbook镜像了。先**查找合适的镜像**。不过由于Docker Hub的服务器在USA，国内又有网络出口限制，因此下载速度可能会很忙，请耐心等待，或者使用国内HUB。

```shell
docker search gitbook
```

![image-20231024235509367](https://img.aa520.cn/test/image-20231024235509367.png)

选好需要镜像后，我们需要**将镜像拉取到本地**

```shell
docker pull docker.io/fellah/gitbook
```

![image-20231025001219069](https://img.aa520.cn/test/image-20231025001219069.png)

基于该镜像**创建一个容器**

```shell
docker run -itd --name="my_gitbook" -h="my_gitbook" -p 4000:4000 -v /data/gitbook/books:/srv/gitbook/books 2908 /bin/bash
```

在创建容器时考虑到可以使用gitbook提供web服务，可以用在搭建web服务器了就将4000端口映射到容器内gitbook的默认端口4000，当然你也可以搭建一个web服务器。 还有就是希望这个容器只是提供gitbook服务，至于md文档我放置在CentOS7的/data/gitbook/books目录就可以，后期的管理更加方便。

![image-20231025001811011](https://img.aa520.cn/test/image-20231025001811011.png)

### 1.4. Gitbook服务

容器创建好了，接下来就是进入容器内部使用gitbook了

```shell
docker exec -it my_gitbook /bin/bash
```

前面讲项目目录文件/data/gitbook/books映射到容器的/srv/gitbook/books目录了，现在进入该目录**初始化gitbook项目并启动预览服务**即可

```shell
cd /srv/gitbook/books
gitbook init .
# gitbook build . 
gitbook serve . &
# gitbook serve --lrport 35730 --port 4001
```

![image-20231025003424356](https://img.aa520.cn/test/image-20231025003424356.png)

### 1.5. 预览

如果上面的一切都OK的话，你就可以通过浏览器访问你的gitbook项目了。

![image-20231025005236919](https://img.aa520.cn/test/image-20231025005236919.png)

### 1.6.GitBook 服务多开

gitbook启动的web 服务默认监听4000端口，而重启监控进程默认监听35729端口。

一般这样可以启动一个电子书web服务:

```shell
gitbook serve /somepath/your_docuemtn_dir/
```

本地就可以这样来访问:  [http://localhost:4000](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Flinks.jianshu.com%2Fgo%3Fto%3Dhttp%3A%2F%2Flocalhost%3A4000)

如果要启动另一部电子书服务的话， 就需要同时修改web端口和监控进程端口， 类似这样:

```shell
gitbook serve --lrport 35288 --port 4001 /path2/your_another_doc_dir/
```

##### 指定端口号再启动

```shell
gitbook serve --lrport 35730 --port 4001
```

### 1. 构建一个自定义的 镜像

编写Dockerfile

```dockerfile
FROM node:7

MAINTAINER Wenyu<admin@zhaowenyu.com>

ARG VERSION=3.2.3

LABEL version=$VERSION

RUN npm install --global gitbook-cli &&\
    gitbook fetch ${VERSION} &&\
    npm cache clear &&\
    rm -rf /tmp/*


RUN wget -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sh /dev/stdin

WORKDIR /srv/gitbook

VOLUME /srv/gitbook /srv/html

EXPOSE 4000 35729

CMD /usr/local/bin/gitbook serve
```

有了Dockerfile，就可以创建镜像了：

```shell
docker build -t gitbook:v2 .
```

最后，可以通过以下命令创建容器：

```shell
docker run -itd --name="my_gitbook2" -h="my_gitbook2" -p 4000:4000 -p 35729:35729 -v /data/books/:/srv/gitbook/books 0e5c /bin/bash
```

GitBook 有如下命令，常用到的有前面6个：

```shell
gitbook init ``//初始化目录文件``
gitbook help ``//列出gitbook所有的命令``
gitbook –help ``//输出gitbook-cli的帮助信息``
gitbook build ``//生成静态网页``
gitbook serve ``//生成静态网页并运行服务器``
gitbook build –gitbook=2.0.1 ``//生成时指定gitbook的版本, 本地没有会先下载``
gitbook ls ``//列出本地所有的gitbook版本``
gitbook ls-remote ``//列出远程可用的gitbook版本``
gitbook fetch 标签/版本号 ``//安装对应的gitbook版本``
gitbook update ``//更新到gitbook的最新版本``
gitbook uninstall 2.0.1 ``//卸载对应的gitbook版本``
gitbook build –log=debug ``//指定log的级别``
gitbook builid –debug ``//输出错误信息
```

### 1.6. 后记

上面使用了一个简单的方法搭建了gitbook服务，其实一开始我并没有这样想，开始我是想先安装nodejs，然后安装npm，然后安装cnpm，然后安装gitbook，然后....但是在安装gitbook的时候卡主了，官方给的npm安装gitbook在Linux和Windows上不能正确安装的，就是因为依赖MacOS上的fsevent模块。这个是错误不是告警，因此不能成功安装，这个应该是npm官方的npm依赖配置有问题，具体没有深究。

还有就是上面的搭建好了之后还有很多可以优化的地方，比如：

- 1.给CVM的IP地址申请一个域名解析到该IP
- 2.在这个CentOS7上搭建一个git Server，以后push md文件就使用git方式
- 3.gitbook serve本身的并发不高，后续可以搭建一个nginx Web服务器代理。





![新版GitBook安装及使用——不完全避坑指南-CSDN博客](https://img.aa520.cn/test/f3de22ac04654f67adc1c64cbb05a834.png)

![GitBook · GitHub](https://img.aa520.cn/test/7111340.png)

![GitBook Library – Resources and inspiration from the best public docs](https://img.aa520.cn/test/qUvSMmI8cjmzYidwKMO5seylHCQ.png)

![Gitbook Avis Tarif & Fonctionnalités | Comparatif-Logiciels.fr](https://img.aa520.cn/test/gitbook-avis-tarif-alternative-comparatif-logiciels-saas.webp)