<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import type {APIError} from '@/assets/scripts/api/types';
import {authAPI} from '@/assets/scripts/api';
import router from '@/router';

enum LoginStatus {
  CHECKING,
  CAN_LOGIN,
  LOGGING_IN,
}


const username = ref('');
const password = ref('');
const loginStatus = ref(LoginStatus.CHECKING);

showNotification("正在检查登录状态...", "checking")

async function checkLoginStatus() {
  try {
    await authAPI.whoami();
    router.back();
    showNotification('您已登录，正在跳转...', 'info')
  } catch (error) {
    loginStatus.value = LoginStatus.CAN_LOGIN;
  }
}

onMounted(() => {
  checkLoginStatus();
});

async function handleLogin() {
  if (!username.value || !password.value) {
    showNotification('请输入用户名和密码', 'warning');
    return;
  }

  try {
    loginStatus.value = LoginStatus.LOGGING_IN;
    await authAPI.login(username.value, password.value);
    showNotification('登录成功', 'success');
    router.back();
  } catch (error) {
    const apiError = error as APIError;
    showNotification(apiError.message || '登录失败', 'error');
  } finally {
    loginStatus.value = LoginStatus.CAN_LOGIN;
  }
}
</script>

<template>
  <div class="view-container">
    <div class="view-card">
      <h1 class="text-2xl font-bold mb-6">用户登录</h1>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label>用户名</label>
          <input
              v-model="username"
              class="input-field"
              placeholder="请输入用户名"
              type="text"
              autocomplete="username"
          >
        </div>

        <div class="input-group">
          <label>密码</label>
          <input
              v-model="password"
              class="input-field"
              placeholder="请输入密码"
              type="password"
              autocomplete="password"
          >
        </div>

        <button
            :disabled="loginStatus !== LoginStatus.CAN_LOGIN"
            class="theme-transition login-button text-neutral-50"
            type="submit"
        >
          {{ loginStatus === LoginStatus.CAN_LOGIN ? '登录' : '处理中...' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/main";

.input-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

.input-field, .login-button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;

  box-sizing: border-box;
}

.login-button {
  @include main.theme-transition("opacity 0.3s ease, background-color 0.3s ease");

  &:hover {
    opacity: 0.9;
  }
}
</style>