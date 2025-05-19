<script lang="ts" setup>
import {onMounted, ref} from 'vue'

const messages = ref([
  "你迷路了，是不是走错了方向？",
  "这里没有你想要的东西，不如去别的地方看看吧。",
  "你似乎迷失了方向。",
  "别看了，这里没有你想要的东西。",
  "魔术师刚刚把这一页变消失了。",
  "拼图丢失了一块，就像这个页面。",
  "这页书被隐形墨水写过，换个章节看看吧？",
  "外星人偷走了这个页面当纪念品...",
])

const currentMessage = ref(messages.value[0])

function showRandomMessage() {
  currentMessage.value = messages.value[Math.floor(Math.random() * messages.value.length)]
  setTimeout(showRandomMessage, 1000 * 120)
}

onMounted(() => {
  showRandomMessage()
})
</script>

<template>
  <div class="view-container">
    <div class="view-card error-card">
      <h1 class="theme-transition text-neutral-900">404</h1>
      <h2 class="theme-transition text-neutral-700">页面不存在</h2>
      <p class="theme-transition text-neutral-600">{{ currentMessage }}</p>
      <router-link class="no-select-no-drag" to="/">
        <button class="home-btn">
          返回主页
        </button>
      </router-link>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@use "@/assets/styles/main"

.error-card
  text-align: center

  h1
    font-size: 6rem
    font-weight: 800
    margin: 0 0 1rem
    line-height: 1

  h2
    font-size: 2rem
    margin: 0 0 1.5rem
    font-weight: 600

  p
    font-size: 1.1rem
    margin: 0 0 2.5rem
    line-height: 1.6

.home-btn
  padding: 1rem 2.5rem
  border-radius: 0.75rem
  font-size: 1.1rem

  @include main.theme-transition("transform 0.2s ease, opacity 0.2s ease")

  &:hover
    opacity: 0.9
    transform: translateY(-.1em)

  &:active
    opacity: 1
    transform: translateY(0)
</style>