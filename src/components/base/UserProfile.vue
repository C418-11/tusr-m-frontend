<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {authAPI} from '@/assets/scripts/api';
import {useRouter} from 'vue-router';

const router = useRouter();
const username = ref('');
const isLoggedIn = ref(false);

// 获取当前用户信息
const fetchUser = async () => {
  try {
    const response = await authAPI.whoami();
    username.value = response.accounts[0]?.username || '用户';
    isLoggedIn.value = true;
  } catch (error) {
    username.value = '未登录';
    isLoggedIn.value = false;
  }
};

// 处理登出
const handleLogout = async () => {
  if (!isLoggedIn.value) {
    await router.push('/login');
    return;
  }
  try {
    await authAPI.logout();
    window.showNotification('已安全登出', 'success');
    await router.push('/login');
  } catch (error) {
    window.showNotification('登出失败，请重试', 'error');
  }
};

onMounted(() => {
  fetchUser();
});
// 在跳转页面时检查
router.afterEach(() => {
  fetchUser();
});
</script>

<template>
  <span class="username theme-transition"
        @click="handleLogout">{{ username }}</span>
</template>

<style lang="scss" scoped>
.username {
  position: absolute;
  left: 50%;
  top: 1.7rem;
  transform: translate(-50%, -50%);

  content: '1';
  font-weight: 500;
  color: var(--neutral-900);
  white-space: nowrap;

  z-index: 9998;
  cursor: pointer;

  padding: .4rem .8rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 0.25rem 1rem rgba(var(--color-box-shadow) / 0.1);
  border-radius: 2rem;
}
</style>