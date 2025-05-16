<script lang="ts" setup>
import {ref, watch} from 'vue'

interface Notification {
  id: number
  message: string
  type: string
}

const notifications = ref<Notification[]>([])
let idCounter = 0

watch(notifications, (newVal) => {
  if (newVal.length === 0) {
    idCounter = 0
  }
}, {deep: true})

function showNotification(message: string, type: string = 'success', duration: number = 5000) {
  const id = idCounter++
  notifications.value.push({id, message, type})

  setTimeout(() => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) notifications.value.splice(index, 1)
  }, duration)
}

// 点击关闭
function removeNotification(id: number) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) notifications.value.splice(index, 1)
}

window.showNotification = showNotification
</script>

<template>
  <TransitionGroup
      class="notifications-container"
      name="notification"
      tag="div"
  >
    <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="`notification-${notification.type}`"
        class="notification"
        @click="removeNotification(notification.id)"
    >
      <div class="notification-content">
        {{ notification.message }}
      </div>
    </div>
  </TransitionGroup>
</template>

<style lang="scss" scoped>
.notifications-container {
  position: fixed;
  display: flex;
  z-index: 9999;
  top: .5em;
  left: .5em;
  gap: 1em;
  flex-direction: column-reverse;

  --notifications-enter-leave-duration: 0.4s;
  --notifications-move-duration: 0.2s;
}

.notification {
  position: relative;
  display: flex;

  gap: .7em;
  padding: 0.7em 1.1em;
  border-radius: 2em;

  width: fit-content;
  align-items: center;
  overflow-wrap: anywhere;
  transition: box-shadow var(--theme-transition-duration);

  box-shadow: 0 .5em 1em rgba(var(--color-box-shadow) / .1);
  backdrop-filter: blur(2em);
  -webkit-backdrop-filter: blur(2em);

  &:before {
    align-self: flex-start;
    content: "";
    width: 1.3em;
    height: 1.3em;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* 处理列表项移动的过渡 */
  &-move {
    transition: transform var(--notifications-move-duration) linear;
  }

  /* 进入和离开动画 */
  &-enter-active,
  &-leave-active {
    transition: transform var(--notifications-enter-leave-duration) cubic-bezier(0.68, -0.55, 0.27, 1.55),
    opacity var(--notifications-enter-leave-duration) linear;
  }

  &-enter-from,
  &-leave-to {
    transform: translateX(-100%);
    opacity: 0;
  }

  /* 类型样式 */
  &-success::before {
    background: var(--color-success);
  }

  &-error::before {
    background: var(--color-error);
  }

  &-warning::before {
    background: var(--color-warning);
  }

  &-info::before {
    background: var(--color-info);
  }

  &-processing::before {
    background: var(--color-processing);
  }

  &-checking::before {
    background: var(--color-checking);
  }
}
</style>