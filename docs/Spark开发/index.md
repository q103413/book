---
layout: doc
editLink: false
lastUpdated: true
---

# ⚡ Spark 内存计算与高性能开发实训

欢迎来到 Spark 内存计算开发模块。本模块将带你跳出 Hadoop MapReduce 繁重的磁盘读写限制，全面进驻以 **内存计算 (In-Memory Computing)** 为核心的第二代大数据计算引擎。我们将基于 Scala 与 Python 语言，深入理解弹性分布式数据集（RDD）算子，并完成企业级大数据分析项目的开发。

---

## 🚀 Spark 实训核心知识图谱

::: tip 为什么学习 Spark？
在实际企业生产中，Spark 比传统的 MapReduce 快 10 到 100 倍。掌握 Spark 的 RDD 算子转换、Spark SQL 结构化查询以及数据倾斜优化，是大数据开发工程师的核心分水岭。
:::

* ```
  ### 🏁 阶段一：开发环境与核心基础
  
  掌握支撑 Spark 运行的函数式编程语言基础与集群连接。
  
  * **语言基石**：[🪶 Scala 编程语言速查手册](../Scala编程/index.md) — 函数式编程与隐式转换核心语法。
  * **本地沙盒**：[💻 IDEA + Maven 搭建 Spark 本地开发环境](./1-Spark本地环境配置.md) — 依赖引入与 `SparkSession` 初始化。
  
  ### 🔮 阶段二：Spark RDD 算子实战（核心计算层）
  
  深入分布式计算的核心抽象，玩转转换（Transformation）与行动（Action）算子。
  
  * **算子演练**：[📝 Spark 核心 RDD 算子转换与案例解析](./2-Spark-RDD算子实战.md) — `map`、`flatMap`、`reduceByKey` 深度拆解。
  * **源码引导**：[🛠️ 经典案例：Spark 版 WordCount 源码在线查看](./spark_wordcount_demo_md.md) — 精简高效的分布式基准测试。
  
  ### 📊 阶段三：Spark SQL 结构化数据分析（高级进阶层）
  
  引入 DataFrame 与 Dataset，像写 SQL 一样处理海量半结构化数据。
  
  * **数仓对接**：[🍯 Spark SQL 读写 Hive 表与外部数据源](./3-SparkSQL与Hive集成.md) — 实现跨分布式组件的混合流转计算。
  ```

  

---

## 🎯 实战案例项目演练

| 综合实战项目                           | 核心技术栈           | 实训任务与考核指标                                       |
| :------------------------------------- | :------------------- | :------------------------------------------------------- |
| **项目 1：电商用户行为路径分析**       | `Spark Core` / `RDD` | 统计 Top10 热门品类、用户 Session 活跃度及漏斗模型转化率 |
| **项目 2：跨地域销售数据离线指标统计** | `Spark SQL` / `Hive` | 编写高效静态/动态分区 SQL，完成多维度报表聚合与指标导出  |
| **项目 3：流处理初探 (Optional)**      | `Spark Streaming`    | 对接 Kafka 消息队列，实现秒级响应的实时热搜榜单计算      |

---

## 📝 辅助实验资源

* ```
  * [⚙️ 辅助脚本：Spark 提交作业（spark-submit）壳脚本](./spark_submit_helper_md.md) — 一键提交 Jar 包到 YARN 模式运行。
  * [🏆 Spark 期末复习与核心面试题](./Spark核心面试题库.md) — 涵盖宽窄依赖、Stage 划分及内存模型核心考点。
  
  ::: info 💡 实战寄语
  代码写得再熟，不如去 Spark Web UI（默认 `4040` 端口）里看一眼 DAG 拓扑图。观察 Stage 是如何划分的，你就能真正明白分布式计算的精髓。
  :::
  ```

  
