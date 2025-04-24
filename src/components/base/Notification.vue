<script lang="ts" setup>

import {type Ref, ref} from "vue";

const notificationContainer: Ref = ref(undefined);

function showNotification(message: string, type: string = 'success', duration: number = 5000) {
  // 创建通知元素
  const notification = document.createElement('div');
  const content = document.createElement('div')
  notification.appendChild(content)

  notification.className = `notification notification-${type} notification-enter-animation`;
  content.className = 'notification-content';
  content.innerText = message;

  // 添加进场动画
  notificationContainer.value.appendChild(notification);
  requestAnimationFrame((() => {
    setTimeout(() => {
      notification.classList.remove('notification-enter-animation');
    }, 0);
  }));

  // 自动消失逻辑
  const autoRemove = setTimeout(() => {
    notification.classList.add('fade-out');
    notification.addEventListener('transitionend', () => notification.remove());
  }, duration);

  // 点击手动关闭
  notification.addEventListener('click', () => {
    clearTimeout(autoRemove);
    notification.classList.add('fade-out');
    notification.addEventListener('transitionend', () => notification.remove());
  });
}

window.showNotification = showNotification;
</script>

<template>
  <div ref="notificationContainer" class="notifications-container"></div>
</template>

<style scoped>
.notifications-container {
  position: fixed;
  display: flex;
  flex-direction: column-reverse;
  z-index: 9999;
}
</style>