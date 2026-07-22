# docker安装MySQL5.7

# 一、Docker配置MySQL容器

需要支持

- Linux服务器

- Docker
- 常用的Linux和Docker命令

## 第一步：拉取MySQL镜像

1、拉取MySQL镜像（注意版本和镜像源）

```dockerfile
#docker pull docker.1ms.run/mysql:5.7
docker pull mysql
```

PS：若出现下载太慢，亦或者连接超时。则参考博主《Docker国内镜像源失效解决方案！》；

2、查看本地镜像，确认是否拉取成功

```dockerfile
docker images
```

![image-20250310011906734](http://img.aa520.cn/test/image-20250310011906734.png)

这里拉取的是MySQL:latest版本，也可以使用docker pull mysql:5.7下载对应版本（以5.7为例）

## 第二步：根据镜像生成容器

1、通过镜像生成容器

```dockerfile
docker run -d --name mysql57  -p 3306:3306  -e TZ=Asia/Shanghai  -e MYSQL_ROOT_PASSWORD=123456 -v /data/mysql/data:/var/lib/mysql   -v /data/mysql/conf:/etc/mysql/conf.d  -v /data/mysql/log:/var/log/mysql   -v /data/mysql/init:/docker-entrypoint-initdb.d  -d 5107
```

```
注释
 [ -d ]: 后台运行
 [ -p ]: 配置端口映射（容器的3306映射到Linux的3307端口）
 [ -e ]: 添加配置信息（密码为123456）
 [ -v ]: 挂载目录（此处 /data/mysql目录为宿主机存放文件目录）
 [ --name ]: 容器名字
 5107 ：镜像ID
```

2、查看目录运行中的容器列表

```
docker ps
```

![image-20250310012120951](http://img.aa520.cn/test/image-20250310012120951.png)

3、进入容器内登录

```
docker exec -it mysql bash
 
mysql -uroot -p
 
#输入密码
```

#  二、创建用户，赋予权限

```sql
CREATE USER 'admin123' IDENTIFIED BY '123456';
 
GRANT ALL PRIVILEGES ON *.* TO 'admin123';
 
FLUSH PRIVILEGES;
```

![image-20250310013347309](http://img.aa520.cn/test/image-20250310013347309.png)

退出mysql和docker容器

```shell
#退出mysql
exit;
 
#退出docker容器
exit
```

记得打开云服务**配置安全策略**，开放我们要使用的3306端口。

# 三、navicat连接

新建mysql连接

![image-20250310012753578](http://img.aa520.cn/test/image-20250310012753578.png)
