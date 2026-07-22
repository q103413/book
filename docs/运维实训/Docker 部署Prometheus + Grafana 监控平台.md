# docker部署Prometheus+Grafana





## 三、使用Prometheus+grafana搭建监控系统

前面，我们了解了一些监控系统的区别和优缺点，下面我们以Prometheus为例，带大家一步一步搭建监控系统。



## 实战

环境

| 服务器    | 部署应用                         | IP              |
| --------- | -------------------------------- | --------------- |
| 本地主机  | Prometheus,Grafana,node-exporter | 192.168.200.134 |
| centos7.6 | node-exporter                    | 192.168.200.135 |

本地机器部署Prometheus+Grafana+node-exporter，远程服务器也部署一个node-exporter。 

![image.png](http://img.aa520.cn/test/dec1b1e9623646df8b3605c737b4bf0ctplv-k3u1fbpfcp-zoom-in-crop-mark1512000.webp)

### 部署node-exporter

本地机器环境搭建

```docker
# 本地创建node-exporter，生产可加上 --restart=always 
docker run -d -p 9100:9100 \
  -v "/Users/dongfengfan/docker/node-exporter/proc:/host/proc:ro" \
  -v "/Users/dongfengfan/docker/node-exporter/sys:/host/sys:ro" \
  -v "/Users/dongfengfan/docker/node-exporter/:/rootfs:ro" \
  --name node-exporter \
  prom/node-exporter
 
# 远程centos创建node-exporter，生产可加上 --restart=always 
docker run -d -p 9100:9100 \
  -v "/root/docker/node-exporter/proc:/host/proc:ro" \
  -v "/root/docker/node-exporter/sys:/host/sys:ro" \
  -v "/root/docker/node-exporter/:/rootfs:ro" \
  --net="host" \
  --name node-exporter \
  prom/node-exporter
```

查看node-exporter是否部署成功 访问 http://192.168.200.134:9100/metrics

![image-20231105164539330](http://img.aa520.cn/test/image-20231105164539330.png)

![image-20231105164711661](http://img.aa520.cn/test/image-20231105164711661.png)

### 部署Prometheus

创建 prometheus.yml

```yaml
global:
  scrape_interval:     60s
  evaluation_interval: 60s
 
scrape_configs:
  - job_name: prometheus
    static_configs:
        #本地服务器加端口 
        #['localhost:9090']
      - targets: ['192.168.200.134:9090']
        labels:
          instance: prometheus
 
  - job_name: localhost-node-exporter
    static_configs:
        #监控本地服务器ip+端口，因为是本地docker启动，所以ip使用host.docker.interna
        #['host.docker.internal:9100']
      - targets: ['192.168.200.134:9100']
        labels:
          instance: localhost-node-exporter
  - job_name: myaliyun
    static_configs:
      #监控远程服务器
      - targets: ['192.168.200.135:9100']
        labels:
          instance: myaliyun
```

启动prometheus

```docker
docker run  -d \
  -p 9090:9090 \
  -v /data/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml  \
  --name prometheus \
  prom/prometheus
```

访问http://192.168.200.134:9090/targets,三个任务已经全部监控上了

![image-20231105173746622](http://img.aa520.cn/test/image-20231105173746622.png)

### 部署Grafana

```docker
mkdir /data/grafana

docker run -d \
  -p 3000:3000 \
  --name=grafana \
  -v /data/grafana:/var/lib/grafana \
  --name grafana \
  grafana/grafana
```

访问 http://192.168.200.134:3000/
 默认会先跳转到登录页面，默认的用户名和密码都是admin
 登录之后，它会要求你重置密码。你还可以再输次admin密码

![image-20231105180026497](http://img.aa520.cn/test/image-20231105180026497.png)

进入首页点击 Add data source 进入首页点击 Add data source

![image-20231105180238038](http://img.aa520.cn/test/image-20231105180238038.png)

![image-20231105180301534](http://img.aa520.cn/test/image-20231105180301534.png)



 配置url为Prometheus地址，我这里因为Grafana和Prometheus都部署在本地docker,所以访问ip使用host.docker.internal 

![image-20231105181219038](http://img.aa520.cn/test/image-20231105181219038.png)

![image.png](http://img.aa520.cn/test/9e07036c24d74ef2ab07ce0f9242404etplv-k3u1fbpfcp-zoom-in-crop-mark1512000.webp) 拉到最下面选择 save & test

### # Node Exporter for Prometheus Dashboard 中文版

访问地址：grafana.com/grafana/dashboards
![image-20231105193358568](http://img.aa520.cn/test/image-20231105193358568.png)

导入数据

![image-20231105182237510](http://img.aa520.cn/test/image-20231105182237510.png)

导入仪表板

![image-20231105193535523](http://img.aa520.cn/test/image-20231105193535523.png)

选择仪表板

![image-20231105193042855](http://img.aa520.cn/test/image-20231105193042855.png)

后面有时间再出一篇文章，如何监控mongo,redis,mysql等中间件。
