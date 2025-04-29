<script lang="ts" setup>
import {computed, customRef, onMounted, type Ref, ref} from "vue";

interface Theme {
  name: string
  icon: string
  desc: string
}

const Themes: Ref<string[]> = ref([]);
const ThemeData: Ref<Record<string, Theme>> = ref({});
const currentTheme: Ref<string> = customRef((track, trigger) => ({
  get: () => {
    const localTheme = localStorage.getItem("theme");
    const documentTheme = document.documentElement.getAttribute("data-theme");
    track();
    return localTheme ?? documentTheme ?? Themes.value[0];
  },
  set: (newValue: string) => {
    localStorage.setItem("theme", newValue);
    document.documentElement.setAttribute("data-theme", newValue);
    trigger();
  }
}));
const nextTheme: Ref<string> = computed(() => {
  const currentIndex = Themes.value.indexOf(currentTheme.value);
  const nextIndex = (currentIndex + 1) % Themes.value.length;
  return Themes.value[nextIndex];
});

function registerTheme(theme: Theme) {
  Themes.value.push(theme.name);
  ThemeData.value[theme.name] = theme;
}

function toggleTheme() {
  currentTheme.value = nextTheme.value;
}

function safeGetData(theme: string) {
  return ThemeData.value[theme] ?? {
    name: undefined,
    icon: "",
    desc: "Undefined"
  }
}

onMounted(() => {
      [
        {
          name: "sync",
          icon: "/images/icons/sync.svg",
          desc: "同步"
        },
        {
          name: "light",
          icon: "/images/icons/sun.svg",
          desc: "亮色"
        },
        {
          name: "dark",
          icon: "/images/icons/cloud.svg",
          desc: "暗色"
        }
      ].forEach(theme => registerTheme(theme));

      // 初始化主题
      currentTheme.value = currentTheme.value;
    }
)
</script>

<template>
  <div class="theme-switcher-container" @click="toggleTheme">
    <img :alt="safeGetData(currentTheme).desc" :src="safeGetData(currentTheme).icon"
         class="theme-switcher-icon theme-switcher-icon-current">
    <img :alt="safeGetData(nextTheme).desc" :src="safeGetData(nextTheme).icon"
         class="theme-switcher-icon theme-switcher-icon-preview">
  </div>
</template>

<style scoped>
.theme-switcher-container {
  position: absolute;
  display: flex;
  top: 0;
  right: 0;
  z-index: 1000;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.theme-switcher-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 3em;
  height: 3em;
  margin: 0.1em;
  transition: opacity 0.3s cubic-bezier(0.46, 0.03, 0.52, 0.96);
  user-select: none;
  -webkit-user-drag: none;
}

.theme-switcher-icon-current {
  z-index: 1;
  opacity: 1;
}

.theme-switcher-icon-preview {
  opacity: 0;
  z-index: 0;
}

.theme-switcher-container:hover .theme-switcher-icon-current {
  opacity: 0;
}

.theme-switcher-container:hover .theme-switcher-icon-preview {
  opacity: 1;
}

@media (hover: none) and (pointer: coarse) {
  /* 禁用所有hover效果 */
  .theme-switcher-container:hover .theme-switcher-icon {
    opacity: 1 !important;
  }

  /* 完全隐藏预览图标 */
  .theme-switcher-icon-preview {
    display: none !important;
  }
}
</style>