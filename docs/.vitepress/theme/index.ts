// docs/.vitepress/theme/index.ts
import DefaultTheme from "vitepress/theme"
import { onMounted } from "vue"
import "./custom.css"

export default {
  extends: DefaultTheme,
  setup() {
    const appendWatermark = () => {
      // 安全检查：只有在浏览器环境且 body 存在时才执行
      if (typeof window !== 'undefined' && document.body && !document.querySelector(".watermark")) {
        const div = document.createElement("div");
        div.className = "watermark";
        document.body.appendChild(div);
      }
    };

    onMounted(() => {
      appendWatermark();
      // 使用 observer 监控 body
      if (typeof window !== 'undefined') {
        const observer = new MutationObserver(appendWatermark);
        observer.observe(document.body, { childList: true });
      }
    });
  },
};
