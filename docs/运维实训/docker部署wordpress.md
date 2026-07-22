# 利用docker部署一个wordpress

## Docker安装WordPress，快速搭建自己的博客

### 1、WordPress介绍

**官网：** https://wordpress.com/zh-cn/

![image-20231013024142644](http://img.aa520.cn/test/image-20231013024142644.png)

WordPress是一种基于php编程语言开发的CMS管理系统，WordPress有丰富的插件和模板，用户可以快速搭建一套功能十分强大的内容管理系统，使用WordPress可以做多种类型的网站，比如新闻发布网站、企业门户、个人技术博客等。

今天给大家分享一下通过docker快速部署一套WordPress系统，感兴趣的朋友可以一起来学习一下！

### 2、Docker快速部署WordPress

#### 一，通过 docker pull 命令在官方网站上把需要的 docker 镜像拉取下来

```shell
docker pull wordpress

docker pull mysql
```

官网地址：[hub.docker.com](https://hub.docker.com/)

##### 二，创建 mysql 容器

```shell
docker run -d --name mysql -v mysql-data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=wordpress mysql
```

参数解析

- **-d ：** 后台运行容器，并返回容器id
- **--name ：** 自定义容器名
- **-v ：**  将容器内的目录挂载到[宿主机](https://cloud.tencent.com/product/cdh?from_column=20065&from=20065)中(前是宿主机路径/后是容器路径)
- **-e ：** 用来指定环境变量以及后续的键值对
- **MYSQL_ROOT_PASSWORD ：** [数据库](https://cloud.tencent.com/solution/database?from_column=20065&from=20065)密码
- **MYSQL_DATABASE ：** 数据库表名
- **mysql ：** 镜像仓库中的镜像标签版本

##### 三，创建 wordpress 容器

```shell
docker run -d -e WORDPRESS_DB_HOST=mysql:3306 --link mysql -p 8083:80 wordpress
```

参数解析

- **-d ：** 后台运行容器，并返回容器id
- **--name ：** 自定义容器名
- **-e ：** 用来指定环境变量以及后续的键值对
- **--WORDPRESS_DB_HOST ：** 数据库链接
- **--link ：** 关联到另一台容器，后面加容器名
- **-p ：** 指定端口映射(前是宿主机/后是容器端口)
- **wordpress ：** wordpress镜像



### 3、浏览器访问

输入你的公网ip+:8083 测试是否可以正常访问。

示例：[127.0.0.1::8083](http://127.0.0.1::8083/)；

```text
用户地址：https://服务器ip:8083
管理地址：https://服务器ip:8083/wp-admin/
```

出现如下界面，证明安装成功

选择安装语言为简体中文；

![image-20231013002407819](http://img.aa520.cn/test/image-20231013002407819.png)

输入网站信息，比如网站标题、登录用户名、密码等。

![image-20231013002445210](http://img.aa520.cn/test/image-20231013002445210.png)

然后安装就成功了。

![image-20231013002951878](http://img.aa520.cn/test/image-20231013002951878.png)

登录系统；

![image-20231013003521400](http://img.aa520.cn/test/image-20231013003521400.png)

登录后的管理主界面；

![image-20231013003426182](http://img.aa520.cn/test/image-20231013003426182.png)

### 4.异常问题解决

url访问后，页面出现以下问题

```bash
Error establishing a database connection
```

 解决办法 

1.进入容器 docker exec -it 容器id /bin/bash

2.编辑配置文件 vim wp-config.php

3.修改数据库账号和密码 **修改下图红框中的内容为你的数据库账号和密码,注意不要去掉引号** 

![image-20231013002000993](http://img.aa520.cn/test/image-20231013002000993.png)

我们在创建基础容器之后，进入容器，进行编辑配置文件的时候，需要使用vim或者vi命令，但是会出现：

![image-20231013001701826](http://img.aa520.cn/test/image-20231013001701826.png)

这是因为vim没有安装。
解决方案 使用如下命令安装：

```shell
apt-get update
apt-get install vim
```

![image-20231013003952868](http://img.aa520.cn/test/image-20231013003952868.png)



### 5、什么是WordPress?

如果你是第一次接触网站搭建，你可能会这些问题: “什么是WordPress?” “怎样用WordPress建立博客?” 或 “怎样用WordPress建立自己的网站或网店?” 简单的回答是：WordPress是一个可以让你简单地建立自己博客，网站，或电子网站商城的工具。也就是说，新手可以用WordPress来建立任何的网站 (如，[个人博客](https://www.jiustore.com/wordpress-blog/)，[生意网站](https://www.jiustore.com/business-website/)，个人网站，会员网站，[论坛](https://www.jiustore.com/bbpress-plugin/)，[电子商务网站](https://www.jiustore.com/woocommerce/)等等)。

最好的事情是：WordPress是免费的。还有，你不需要任何的专业知识或网站设计知识，你可以从零开始学习WordPress。你只需要几个小时就可以学习用WordPress建站以及学会如何操作你的博客，网站，或网店。从现在起，博主就把你带进WordPress的魅力世界。

#### 什么是WordPress?

WordPress是一种使用PHP语言开发的网站平台。目前，WordPress是最多人和最容易使用的网站建立工具 (或内容管理系统，英文是CMS或Content Management System)。![image-20231013023558652](http://img.aa520.cn/test/image-20231013023558652.png)

#### 还不太明白什么是WordPress？

一般的网站都有后台管理的。例如，你注册了一个QQ空间，新浪博客，或百度空间，你需要登陆后才可以发布内容 (如，文章，照片，视频等等)。那么，这里所说的WordPress，其实就是一个提供网站后台的程序。当你安装WordPress后，你就拥有一个独立的网站管理后台。WordPress后台+Wordpress主题，就构成了一个完整的网站。登陆后台后，WordPress有过万的免费主题 (themes)。你可以选择自己喜欢的主题来展现自己的风格。

#### WordPress的操作简单

其实，WordPress的操作是很简单，但是你需要看些教程。几个小时就可以自己学会如何使用WordPress。

#### 谁在用WordPress这个免费工具

我们近些年建立的网站和网上商店都是用WordPress搭建的。现在很多的个人网站，独立博客，公司网站，会员网站都是用WordPress做的。就连纽约时报博客 (New York Times’ blogs)和CNN新闻博客 (CNN’s on-air personality blogs)也是采用WordPress。

### 实例1:

![img](http://img.aa520.cn/test/StoreFront-Theme-子主题-1-1024x576-1697141072991-9.png)

------

### 实例2:

![img](http://img.aa520.cn/test/StoreFront-Theme-子主题-2-1024x576-1697141072991-11.png)

------

### 实例3:

![img](http://img.aa520.cn/test/StoreFront-Theme-子主题-3-1024x576-1697141072991-13.png)

------

### 实例4:

![img](http://img.aa520.cn/test/StoreFront-Theme-子主题-4-1024x576.png)

------

### 实例5:

![img](http://img.aa520.cn/test/StoreFront-Theme-子主题-5-1024x576.png)

------

### 实例6:

![img](http://img.aa520.cn/test/StoreFront-Theme-子主题-6-1024x576.png)

------

### 实例7:

![img](http://img.aa520.cn/test/StoreFront-Theme-子主题-7-1024x576-1697141072991-18.png)



## 通过docker-compose构建

# 实战 WordPress



> 本小节内容适合 `PHP` 开发人员阅读。

`Compose` 可以很便捷的让 `Wordpress` 运行在一个独立的环境中。

## 创建空文件夹

假设新建一个名为 `wordpress` 的文件夹，然后进入这个文件夹。

## 创建 `docker-compose.yml` 文件

[`docker-compose.yml`](https://github.com/yeasy/docker_practice/blob/master/compose/demo/wordpress/docker-compose.yml) 文件将开启一个 `wordpress` 服务和一个独立的 `MySQL` 实例：

version: "3"

services:



   db:

​     image: mysql:8.0

​     command:

​      \- --default_authentication_plugin=mysql_native_password

​      \- --character-set-server=utf8mb4

​      \- --collation-server=utf8mb4_unicode_ci     

​     volumes:

​       \- db_data:/var/lib/mysql

​     restart: always

​     environment:

​       MYSQL_ROOT_PASSWORD: somewordpress

​       MYSQL_DATABASE: wordpress

​       MYSQL_USER: wordpress

​       MYSQL_PASSWORD: wordpress



   wordpress:

​     depends_on:

​       \- db

​     image: wordpress:latest

​     ports:

​       \- "8000:80"

​     restart: always

​     environment:

​       WORDPRESS_DB_HOST: db:3306

​       WORDPRESS_DB_USER: wordpress

​       WORDPRESS_DB_PASSWORD: wordpress

volumes:

  db_data:

## 构建并运行项目

运行 `docker-compose up -d` Compose 就会拉取镜像再创建我们所需要的镜像，然后启动 `wordpress` 和数据库容器。 接着浏览器访问 `127.0.0.1:8000` 端口就能看到 `WordPress` 安装界面了。