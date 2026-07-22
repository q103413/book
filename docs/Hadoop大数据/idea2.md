在 IntelliJ IDEA 中运行 MapReduce 脚本通常有两种模式：**本地模式 (Local Mode)** 和 **集群模式 (Cluster Mode)**。

对于开发和调试，强烈推荐使用 **本地模式**，它不需要连接 HDFS 或启动 YARN，速度快且方便调试。

下面是使用 IntelliJ IDEA 运行 MapReduce 程序的详细步骤（以您提供的 `race.SelectData` 类为例）。

------



## 💻 步骤一：确保项目配置正确



MapReduce 项目通常基于 Maven 或 Gradle 构建，需要确保已正确引入 Hadoop 依赖。

1. **检查依赖：** 确保您的 `pom.xml` 中包含了 Hadoop 的 `client` 和 `common` 依赖（或者您正在使用的 Hadoop 版本依赖），例如：

   XML

   ```
   <dependency>
       <groupId>org.apache.hadoop</groupId>
       <artifactId>hadoop-client</artifactId>
       <version>3.3.6</version> </dependency>
   ```

2. **JDK版本：** 确保您的项目使用的 Java 版本（如 JDK 8/11/17）与您的 Hadoop 版本兼容。



## 💾 步骤二：准备本地输入数据



在本地模式下运行 MapReduce，您不需要 HDFS，只需要在本地文件系统（如 Windows 路径）中准备好输入文件。

1. 在您的项目根目录或任何方便的位置创建一个文件夹，例如 `C:\mapreduce_data\input`。
2. 将您的原始日志文件（如 CSV 文件）放入 `input` 文件夹中。
3. 创建一个空的 `C:\mapreduce_data\output` 文件夹作为程序的输出目录。



## ⚙️ 步骤三：创建并配置运行配置 (Run Configuration)



这是在 IDEA 中运行任何 Java main 方法的核心步骤。

1. **打开配置：** 在 IDEA 顶部菜单栏，选择 **Run (运行)** -> **Edit Configurations... (编辑配置)**。

2. **创建新的应用配置：**

   - 点击左上角的 **[+]** 图标。
   - 选择 **Application (应用程序)**。

3. **配置主类 (Main Class)：**

   - 在 **Main class** 字段中，输入您要运行的类名：

     ```
     race.SelectData
     ```

4. **配置程序参数 (Program Arguments)：**

   - 您的 `SelectData` 类的 `main` 方法要求输入读取路径和输出路径。
   - 在 **Program arguments** 字段中，输入您准备的本地路径，用空格隔开：

   ```
   C:\mapreduce_data\input\your_log_file.csv C:\mapreduce_data\output
   ```

   *(请将路径替换为您实际使用的本地路径和文件名)*

5. **配置工作目录 (Working Directory)：**

   - 建议保持默认设置，或者设置为您的项目根目录。



## 🚀 步骤四：运行和调试



现在，您可以像运行任何 Java 程序一样运行您的 MapReduce 脚本了。

1. **运行：** 点击 IDEA 工具栏上的 **[运行]** (绿色播放按钮) 或 **[调试]** (绿色臭虫按钮)。
2. **观察日志：**
   - 程序将在 IDEA 的 **Run** 窗口中输出运行日志（包括您之前看到的 SLF4J 警告等）。
   - **注意：** 如果程序运行成功，控制台末尾会输出 `System.exit(0)` 或类似信息。
3. **检查结果：**
   - 运行完成后，检查您在步骤二中创建的本地输出文件夹 (`C:\mapreduce_data\output`)。
   - 如果运行成功，该文件夹下会生成一个新的文件夹，其中包含结果文件，例如 `_SUCCESS` 和 `part-m-00000`（或 `part-r-00000`，取决于您是否使用了 Reducer）。
   - 由于您使用了 `SequenceFileOutputFormat`，输出的 `part-m-00000` 文件是二进制文件，您可能无法直接打开查看，但它已正确生成。

------



## 🌟 模式切换：本地模式 vs. 伪分布式/集群模式



您的代码在默认情况下会以**本地模式**运行，因为它没有显式地加载 Hadoop 集群配置文件。



### 切换到伪分布式/集群模式 (可选)



如果您希望在 IDEA 中直接向本地安装的 Hadoop 或远程集群提交任务，您需要在项目配置中加载集群的配置文件。

1. **获取配置文件：** 将您的 Hadoop 安装目录下的以下配置文件拷贝到项目的 `src/main/resources` 目录下：
   - `core-site.xml`
   - `hdfs-site.xml`
   - `mapred-site.xml`
   - `yarn-site.xml`
2. **代码自动加载：** 由于您的代码使用了 `new Configuration()`，Hadoop 会自动在 Classpath 中查找并加载这些 XML 文件，从而切换到**伪分布式或集群模式**。此时，您在 **Program arguments** 中输入的路径就必须是 **HDFS 路径**（例如 `/user/hadoop/input /user/hadoop/output`）。