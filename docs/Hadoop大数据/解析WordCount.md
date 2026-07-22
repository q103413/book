 **Hadoop MapReduce 框架中最经典、最基础的示例程序——WordCount（单词计数）**。它的目标是统计输入文本文件中每个单词出现的总次数。

这个程序完美地展示了 MapReduce 的核心思想：**分而治之**。

------



## 📚 WordCount 程序核心原理讲解

WordCount 程序分为三个主要部分：**Mapper（映射器）、Reducer（归约器）** 和 **Driver（驱动器）**。

### 1. Mapper 模块：`TokenizerMapper`

**功能：将文本分解成单词，并给每个单词赋予初始计数 1。**

| **概念** | **解释**                                                     |
| -------- | ------------------------------------------------------------ |
| **输入** | `(Object key, Text value)`。`value` 是一行文本（例如：`"The quick brown fox"`）。 |
| **逻辑** | 1. 使用 `StringTokenizer` 将输入的 `value` (一行文本) 分割成单独的单词（Token）。 2. 循环遍历所有单词。 |
| **输出** | `context.write(word, one)`。**Key** 是一个单词 (`Text`)，**Value** 是 `1` (`IntWritable`)。 |
| **示例** | 如果输入一行是 `"cat dog cat"`，Mapper 会输出： `("cat", 1)` `("dog", 1)` `("cat", 1)` |

### 2. Reducer 模块：`IntSumReducer`

**功能：接收同一个单词的所有计数，并将它们加起来得到总和。**

) and outputting (cat, 3)]

| **概念** | **解释**                                                     |
| -------- | ------------------------------------------------------------ |
| **输入** | `(Text key, Iterable<IntWritable> values)`。 **Key** 是一个**唯一**的单词（例如：`"cat"`）。 **Values** 是该单词在所有 Mapper 中输出的 `1` 的列表（例如：`[1, 1, 1]`）。 |
| **逻辑** | 1. 初始化 `sum = 0`。 2. 遍历 `values` 列表，将所有的 `1` 累加到 `sum` 中。 |
| **输出** | `context.write(key, result)`。**Key** 是单词 (`Text`)，**Value** 是单词的**总次数** (`IntWritable`)。 |
| **示例** | 接收 `("cat", [1, 1, 1])`，计算 $1+1+1=3$，最终输出： `("cat", 3)` |

------



## 🛠️ MapReduce 关键步骤（Shuffle）

在 Mapper 和 Reducer 之间有一个由 Hadoop 框架自动完成的**“Shuffle”（洗牌）** 阶段，这是 MapReduce 能工作的关键：

1. **分组 (Grouping):** 框架将所有 Mapper 的输出，**按 Key（即单词）进行分组**。所有相同的 Key 都会被收集到一起。
2. **排序 (Sorting):** 在分组之前，Key 会被**排序**。这确保了 Reducer 能够按序接收数据。
3. **分发 (Transferring):** 将分组后的数据发送给对应的 Reducer 实例。

### 💡 Combiner (可选的优化步骤)

请注意 `main` 方法中设置了这行代码：

```java
job.setCombinerClass(IntSumReducer.class); 
```

- **Combiner** 是一种**本地 Reducer**。它在 Mapper 所在的节点上运行。
- **作用：** 在数据通过网络传输给 Reducer 之前，**先在本地对相同 Key 的计数进行初步求和**。
- **优点：** 极大地**减少了 Mapper 到 Reducer 之间的数据传输量**，提高了效率。在这个 WordCount 例子中，Combiner 和 Reducer 使用了同一个类 (`IntSumReducer`)，因为它执行的操作（求和）是**可交换、可结合**的。

------



## ⚙️ Driver 模块：`main` 方法

这是程序的入口，负责配置和启动 MapReduce 作业。

1. **配置与参数解析:**
   - `Configuration conf = new Configuration();`：加载 Hadoop 配置。
   - `GenericOptionsParser`：处理命令行参数，特别是输入文件路径 (`<in>`) 和输出目录 (`<out>`)。
2. **创建 Job:**
   - `Job job = Job.getInstance(conf, "word count");`：创建一个作业实例，并命名为 "word count"。
3. **设置类:**
   - `job.setJarByClass(WordCount.class);`：指定包含作业的 Jar 包主类。
   - `job.setMapperClass(TokenizerMapper.class);`：指定 Mapper 类。
   - `job.setCombinerClass(IntSumReducer.class);`：指定 Combiner 类（本地优化）。
   - `job.setReducerClass(IntSumReducer.class);`：指定 Reducer 类。
4. **设置输出数据类型:**
   - `job.setOutputKeyClass(Text.class);`：最终输出 Key 的类型是 **单词** (`Text`)。
   - `job.setOutputValueClass(IntWritable.class);`：最终输出 Value 的类型是 **总次数** (`IntWritable`)。
5. **设置路径:**
   - `FileInputFormat.addInputPath(...)`：指定一个或多个输入文件/目录。
   - `FileOutputFormat.setOutputPath(...)`：指定输出结果存放的目录（这个目录不能事先存在）。
6. **运行:**
   - `System.exit(job.waitForCompletion(true) ? 0 : 1);`：提交作业，等待它完成，并根据结果返回退出码。

------

总而言之，这个 `WordCount` 程序是一个分步、并行处理大数据的典范，它的基本流程是：**将文本打散  局部计数 网络传输  最终求和 输出结果**。

