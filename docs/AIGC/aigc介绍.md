# AIGC介绍

**AIGC（AI Generated Content，人工智能生成内容）**是指利用人工智能模型自动生成文本、图像、音频、视频、代码等内容的技术统称，核心是大模型（LLM、扩散模型等）。常见分支：

- **文本生成**：ChatGPT/Claude/文心一言等，写作、对话、代码生成
- **图像生成**：Midjourney、Stable Diffusion、DALL·E
- **视频生成**：Sora、可灵、Runway
- **音频/音乐生成**：Suno、ElevenLabs
- **代码生成**：Claude Code、Copilot、Cursor



# 怎么学（分层次）

## **1. 先建立概念框架（1-2周）**

- 理解 Transformer、Attention 机制的基本原理（不用深究数学，先懂"是什么、为什么有效"）
- 了解生成式模型的几大类：自回归（GPT系）、扩散模型（Stable Diffusion系）
- 推荐资源：李沐的《动手学深度学习》、3Blue1Brown 的 Transformer 讲解视频

## **2. 作为使用者：先会用工具（并行进行）**

- Prompt Engineering：怎么写好提示词，让模型输出符合预期
- 主流工具的 API 调用（OpenAI/Anthropic API 格式基本类似，学一个通用）
- 结合你熟悉的 Go/Python，写几个调用 LLM API 的小项目（比如自动生成周报、代码审查助手）

## **3. 作为开发者：深入应用层**

- RAG（检索增强生成）：让模型结合私有知识库回答问题，这个和你的知识库迁移经验很契合
- Agent 开发：工具调用、多步骤任务编排（你之前问过 OpenClaw，这块可以继续深入）
- 微调（Fine-tuning）：LoRA、QLoRA 等轻量化微调方法

## **4. 如果想做底层研究**

- 精读经典论文：《Attention Is All You Need》《DDPM》
- 跑通开源模型部署（比如本地部署 Llama、Stable Diffusion），这个和 Linux/云运维背景结合会很顺

