# Maven新手学习笔记 - 实操指南

## 1. Maven概述

Maven是Apache软件基金会的一个项目管理和构建自动化工具，主要用于Java项目的依赖管理、构建、测试和部署。

### Maven的核心功能
- **依赖管理**：自动下载和管理项目所需的库文件
- **项目构建**：编译、打包、测试自动化
- **项目结构标准化**：统一的目录结构和约定
- **生命周期管理**：标准化的构建流程

## 2. Maven安装配置

### 2.1 下载安装
```bash
# 1. 下载Maven（访问 https://maven.apache.org/download.cgi）
# 2. 解压到指定目录，如：C:\apache-maven-3.9.4

# 3. 配置环境变量
MAVEN_HOME=C:\apache-maven-3.9.4
PATH=%PATH%;%MAVEN_HOME%\bin
```

### 2.2 验证安装
```bash
mvn -version
# 输出示例：
# Apache Maven 3.9.4
# Maven home: C:\apache-maven-3.9.4
# Java version: 11.0.19
```

### 2.3 配置本地仓库
编辑 `{MAVEN_HOME}/conf/settings.xml`：
```xml
<localRepository>D:\maven-repository</localRepository>
```

## 3. Maven项目结构

Maven采用标准的目录结构，这是"约定优于配置"原则的体现：

```
my-project/
├── pom.xml                    # 项目对象模型文件
├── src/
│   ├── main/
│   │   ├── java/             # Java源代码
│   │   ├── resources/        # 资源文件
│   │   └── webapp/           # Web资源（仅Web项目）
│   └── test/
│       ├── java/             # 测试源代码
│       └── resources/        # 测试资源文件
└── target/                   # 构建输出目录
    ├── classes/              # 编译后的类文件
    ├── test-classes/         # 测试类文件
    └── *.jar                 # 打包后的文件
```

## 4. POM.xml详解

POM（Project Object Model）是Maven项目的核心文件，包含项目信息和配置。

### 4.1 基本POM结构
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <!-- 项目坐标 -->
    <groupId>com.example</groupId>
    <artifactId>my-project</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <!-- 项目信息 -->
    <name>My Project</name>
    <description>项目描述</description>
    
    <!-- 属性定义 -->
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    
    <!-- 依赖管理 -->
    <dependencies>
        <!-- 在这里添加依赖 -->
    </dependencies>
    
    <!-- 构建配置 -->
    <build>
        <!-- 插件配置 -->
    </build>
</project>
```

### 4.2 Maven坐标系统
Maven使用三维坐标唯一标识一个项目：

| 坐标元素 | 说明 | 示例 |
|---------|------|------|
| groupId | 组织或公司域名倒写 | com.example |
| artifactId | 项目名称 | my-project |
| version | 版本号 | 1.0.0 |

## 5. 实操：创建第一个Maven项目

### 5.1 使用命令行创建项目
```bash
mvn archetype:generate \
    -DgroupId=com.example \
    -DartifactId=hello-maven \
    -DarchetypeArtifactId=maven-archetype-quickstart \
    -DinteractiveMode=false
```

### 5.2 进入项目目录
```bash
cd hello-maven
tree /f  # Windows下查看目录结构
```

### 5.3 编写第一个类
在 `src/main/java/com/example/App.java`：
```java
package com.example;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello Maven!");
    }
    
    public String getMessage() {
        return "Hello Maven!";
    }
}
```

### 5.4 编写测试类
在 `src/test/java/com/example/AppTest.java`：
```java
package com.example;

import org.junit.Test;
import static org.junit.Assert.*;

public class AppTest {
    @Test
    public void testGetMessage() {
        App app = new App();
        assertEquals("Hello Maven!", app.getMessage());
    }
}
```

## 6. Maven生命周期

Maven有三个内置的构建生命周期：

### 6.1 生命周期流程图
```
Default生命周期主要阶段：
validate → compile → test → package → verify → install → deploy

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   validate  │───▶│   compile   │───▶│    test     │
│  验证项目   │    │  编译源码   │    │  运行测试   │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   deploy    │◀───│   install   │◀───│   package   │
│ 部署到远程  │    │ 安装到本地  │    │   打包项目  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 6.2 常用生命周期命令
| 命令 | 作用 | 实际操作 |
|------|------|----------|
| `mvn compile` | 编译主代码 | 编译src/main/java |
| `mvn test` | 运行测试 | 编译并运行测试 |
| `mvn package` | 打包项目 | 生成jar/war文件 |
| `mvn install` | 安装到本地仓库 | 将包安装到本地 |
| `mvn clean` | 清理项目 | 删除target目录 |

## 7. 实操：构建项目

### 7.1 编译项目
```bash
mvn compile
# 输出：
# [INFO] Compiling 1 source file to D:\hello-maven\target\classes
```

### 7.2 运行测试
```bash
mvn test
# 输出：
# [INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
```

### 7.3 打包项目
```bash
mvn package
# 生成：target/hello-maven-1.0-SNAPSHOT.jar
```

### 7.4 运行打包后的程序
```bash
java -cp target/hello-maven-1.0-SNAPSHOT.jar com.example.App
# 输出：Hello Maven!
```

## 8. 依赖管理

### 8.1 添加依赖
在pom.xml中添加依赖：
```xml
<dependencies>
    <!-- JUnit测试框架 -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
        <scope>test</scope>
    </dependency>
    
    <!-- Apache Commons Lang -->
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-lang3</artifactId>
        <version>3.12.0</version>
    </dependency>
</dependencies>
```

### 8.2 依赖范围（Scope）
| Scope | 编译 | 测试 | 运行 | 示例 |
|-------|------|------|------|------|
| compile | ✓ | ✓ | ✓ | 默认范围 |
| provided | ✓ | ✓ | ✗ | servlet-api |
| runtime | ✗ | ✓ | ✓ | mysql-driver |
| test | ✗ | ✓ | ✗ | junit |

### 8.3 查看依赖树
```bash
mvn dependency:tree
# 输出依赖关系树状图
```

## 9. 实操：使用第三方库

### 9.1 修改POM添加依赖
```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.12.0</version>
</dependency>
```

### 9.2 使用第三方库
修改 `App.java`：
```java
package com.example;

import org.apache.commons.lang3.StringUtils;

public class App {
    public static void main(String[] args) {
        String text = "  Hello Maven!  ";
        String trimmed = StringUtils.strip(text);
        System.out.println("原文: '" + text + "'");
        System.out.println("处理后: '" + trimmed + "'");
    }
}
```

### 9.3 重新构建运行
```bash
mvn clean package
java -cp target/hello-maven-1.0-SNAPSHOT.jar com.example.App
```

## 10. Maven插件

### 10.1 常用插件配置
```xml
<build>
    <plugins>
        <!-- 编译插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>11</source>
                <target>11</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>
        
        <!-- 可执行JAR插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-shade-plugin</artifactId>
            <version>3.4.1</version>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>shade</goal>
                    </goals>
                    <configuration>
                        <transformers>
                            <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                <mainClass>com.example.App</mainClass>
                            </transformer>
                        </transformers>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

## 11. 实操：创建可执行JAR

### 11.1 配置Shade插件
添加上述shade插件配置到pom.xml

### 11.2 构建可执行JAR
```bash
mvn clean package
# 生成两个JAR文件：
# - hello-maven-1.0-SNAPSHOT.jar (原始JAR)
# - hello-maven-1.0-SNAPSHOT-shaded.jar (包含依赖的可执行JAR)
```

### 11.3 运行可执行JAR
```bash
java -jar target/hello-maven-1.0-SNAPSHOT-shaded.jar
```

## 12. 多模块项目

### 12.1 创建父项目
```bash
mvn archetype:generate \
    -DgroupId=com.example \
    -DartifactId=multi-module-project \
    -DarchetypeArtifactId=maven-archetype-quickstart \
    -DinteractiveMode=false
```

### 12.2 父项目POM配置
```xml
<groupId>com.example</groupId>
<artifactId>multi-module-project</artifactId>
<version>1.0.0</version>
<packaging>pom</packaging>

<modules>
    <module>common-utils</module>
    <module>web-service</module>
</modules>
```

### 12.3 子模块结构
```
multi-module-project/
├── pom.xml              # 父POM
├── common-utils/        # 子模块1
│   └── pom.xml
└── web-service/         # 子模块2
    └── pom.xml
```

## 13. 常见问题与解决方案

### 13.1 依赖冲突
```bash
# 查看依赖冲突
mvn dependency:tree -Dverbose

# 排除特定依赖
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>5.3.21</version>
    <exclusions>
        <exclusion>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 13.2 编码问题
```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
</properties>
```

### 13.3 跳过测试
```bash
mvn package -DskipTests     # 跳过测试执行
mvn package -Dmaven.test.skip=true  # 跳过测试编译和执行
```

## 14. Maven最佳实践

### 14.1 版本管理
- 使用语义化版本：`主版本.次版本.修订版本`
- 开发版本使用SNAPSHOT：`1.0.0-SNAPSHOT`
- 发布版本去掉SNAPSHOT：`1.0.0`

### 14.2 依赖管理
- 优先使用最新稳定版本
- 定期更新依赖版本
- 使用dependencyManagement统一管理版本
- 避免传递依赖冲突

### 14.3 项目结构
- 遵循Maven标准目录结构
- 合理组织包结构
- 分离业务代码和测试代码
- 使用resources目录管理配置文件

## 15. 实用命令速查表

| 命令 | 说明 |
|------|------|
| `mvn archetype:generate` | 创建新项目 |
| `mvn clean` | 清理target目录 |
| `mvn compile` | 编译源代码 |
| `mvn test` | 运行测试 |
| `mvn package` | 打包项目 |
| `mvn install` | 安装到本地仓库 |
| `mvn deploy` | 部署到远程仓库 |
| `mvn dependency:tree` | 查看依赖树 |
| `mvn dependency:resolve` | 下载依赖 |
| `mvn help:effective-pom` | 查看有效POM |
| `mvn clean package -DskipTests` | 跳过测试打包 |

---

## 总结

Maven作为Java生态系统中最重要的构建工具之一，掌握其核心概念和实操技能对Java开发者至关重要。通过本笔记的学习和实践，您应该能够：

1. 理解Maven的基本概念和原理
2. 创建和管理Maven项目
3. 配置依赖和插件
4. 使用Maven生命周期构建项目
5. 解决常见的Maven问题

建议多实践，逐步掌握Maven的高级特性，如多模块项目管理、自定义插件开发等。