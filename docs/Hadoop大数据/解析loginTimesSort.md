

## 一、这个程序要做什么？

**简单来说：给用户的登录次数排个名次**

比如有这样的数据：

```
user1@qq.com    5
user2@qq.com    10
user3@qq.com    3
```

程序处理后变成：

```
user2@qq.com    10    (登录最多)
user1@qq.com    5
user3@qq.com    3     (登录最少)
```

------

## 二、MapReduce 是什么？

把 MapReduce 想象成**流水线工作**：

1. **Map（地图工）** - 负责"分类整理"
2. **Shuffle（搬运工）** - Hadoop自动完成，负责"归类运输"
3. **Reduce（总结工）** - 负责"汇总输出"

------

## 三、代码详细讲解

### 📍 Part 1: Mapper（分类整理工）

```java
public static class MyMap extends Mapper<Object, Text, IntWritable, Text> {
    public void map(Object key, Text value, Context context)
            throws IOException, InterruptedException {
        String line = value.toString();
        String arr[] = line.split("\t");  // 用Tab键分割
        
        // 把 "邮箱  次数" 变成 "次数  邮箱"
        context.write(
            new IntWritable(Integer.parseInt(arr[1])),  // 登录次数作为key
            new Text(arr[0])                             // 邮箱作为value
        );
    }
}
```

**做了什么？**

```
输入：user1@qq.com    5
处理：split("\t") 分割成 ["user1@qq.com", "5"]
      arr[0] = "user1@qq.com"
      arr[1] = "5"
输出：5    user1@qq.com   （把次数放前面！）
```

**为什么要把次数放前面？** 因为 Hadoop 会**自动按 key 排序**！把次数当key，就能自动排序了。

------

### 📍 Part 2: Shuffle（Hadoop自动完成）

Mapper输出后，Hadoop会：

1. **按key（登录次数）排序**
2. **相同key的数据分到一起**

```
Map输出：
5    user1@qq.com
10   user2@qq.com
3    user3@qq.com

Shuffle后（已排序）：
3    user3@qq.com
5    user1@qq.com
10   user2@qq.com
```

------

### 📍 Part 3: Reducer（汇总输出工）

```java
public static class MyReduce extends Reducer<IntWritable, Text, Text, IntWritable> {
    public void reduce(IntWritable key, Iterable<Text> values,
                       Context context)
            throws IOException, InterruptedException {
        for (Text value : values) {
            // 再把 "次数  邮箱" 换回 "邮箱  次数"
            context.write(value, key);
        }
    }
}
```

**做了什么？**

```
输入：3    [user3@qq.com]
处理：交换key和value的位置
输出：user3@qq.com    3
```

------

### 📍 Part 4: Main（主程序）

```java
public static void main(String[] args) throws Exception {
    Configuration conf = new Configuration();  // 配置对象
    
    // 检查参数：必须有输入路径和输出路径
    if (otherArgs.length < 2) {
        System.err.println("必须输入读取文件路径和输出路径");
        System.exit(2);
    }
    
    Job job = Job.getInstance(conf, "Logins Sort");  // 创建任务
    
    // 设置三大组件
    job.setMapperClass(MyMap.class);      // 用哪个Mapper
    job.setReducerClass(MyReduce.class);  // 用哪个Reducer
    
    // 设置数据类型
    job.setMapOutputKeyClass(IntWritable.class);    // Map输出的key类型
    job.setMapOutputValueClass(Text.class);         // Map输出的value类型
    job.setOutputKeyClass(Text.class);              // 最终输出的key类型
    job.setOutputValueClass(IntWritable.class);     // 最终输出的value类型
    
    // 设置输入输出路径
    FileInputFormat.addInputPath(job, new Path(otherArgs[0]));    // 输入
    FileOutputFormat.setOutputPath(job, new Path(otherArgs[1]));  // 输出
    
    // 提交任务并等待完成
    System.exit(job.waitForCompletion(true) ? 0 : 1);
}
```

------

## 四、完整流程示例

**原始数据（input.txt）：**

```
alice@qq.com    5
bob@qq.com      10
carol@qq.com    3
```

**Step 1: Mapper处理**

```
5     alice@qq.com
10    bob@qq.com
3     carol@qq.com
```

**Step 2: Shuffle自动排序**

```
3     carol@qq.com
5     alice@qq.com
10    bob@qq.com
```

**Step 3: Reducer输出**

```
carol@qq.com    3
alice@qq.com    5
bob@qq.com      10
```

------

## 五、核心技巧总结

| 步骤    | 技巧                  | 原因                  |
| ------- | --------------------- | --------------------- |
| Mapper  | 把要排序的字段作为key | Hadoop会自动按key排序 |
| Reducer | 再把key-value换回来   | 恢复原来的格式        |

------

## 六、代码中的问题

### ⚠️ 问题1：排序方向

现在是**升序**（3→5→10），如果要**降序**（10→5→3）需要修改

### ⚠️ 问题2：没有数据验证

如果数据格式错误（比如只有一列），程序会崩溃

------

## 七、运行命令示例

```bash
# 编译
javac -classpath hadoop-core.jar loginTimesSort.java

# 打包
jar -cvf loginTimesSort.jar *.class

# 运行
hadoop jar loginTimesSort.jar hadoop.tipdm.com.loginTimesSort /input /output
```

------



