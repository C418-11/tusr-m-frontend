<script lang="ts" setup>
import {computed, type Ref, ref} from 'vue';
import {authAPI} from '@/assets/scripts/api';
import router from "@/router";
import type {Account} from "@/assets/scripts/api/types";


const userInfo: Ref<Account | undefined> = ref(undefined);

const username = computed(() => {
  return userInfo.value?.username ?? '未登录';
});
const isLoggedIn = computed(() => {
  return userInfo.value?.active ?? false;
});

// 获取当前用户信息
const fetchUser = async () => {
  let response
  try {
    response = await authAPI.whoami();
  }
  catch (error) {
    userInfo.value = undefined;
    return;
  }

  userInfo.value = response.accounts[0]
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

router.beforeEach(() => {
  fetchUser();
})
</script>

<template>
  <span class="username theme-transition"
        @click="handleLogout">{{ username }}</span>
</template>

<style lang="scss" scoped>
.username {
  position: fixed;
  left: 50%;
  top: 1.6rem;
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
  box-shadow: 0 0.25rem 1rem rgba(var(--color-box-shadow) / .1);
  border-radius: 2rem;
}
</style>