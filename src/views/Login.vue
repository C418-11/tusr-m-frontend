<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import type {APIError} from '@/assets/scripts/api';
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

showNotification("正在检查登录状态...", "success")

async function checkLoginStatus() {
  try {
    await authAPI.whoami();
    router.back();
    showNotification('您已登录，正在跳转...', 'success')
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
  <div class="login-container">
    <div class="login-card theme-transition">
      <h1 class="theme-transition text-neutral-900 text-2xl font-bold mb-6">用户登录</h1>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label class="theme-transition text-neutral-700">用户名</label>
          <input
              v-model="username"
              class="theme-transition input-field"
              placeholder="请输入用户名"
              type="text"
          >
        </div>

        <div class="input-group">
          <label class="theme-transition text-neutral-700">密码</label>
          <input
              v-model="password"
              class="theme-transition input-field"
              placeholder="请输入密码"
              type="password"
          >
        </div>

        <button
            :disabled="loginStatus !== LoginStatus.CAN_LOGIN"
            class="theme-transition login-button"
            type="submit"
        >
          {{ loginStatus === LoginStatus.CAN_LOGIN ? '登录' : '处理中...' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.login-card {
  background: var(--neutral-50);
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: max(300px, 10vw);
}

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

.input-field {
  border-color: transparent;
  color: var(--neutral-700);
  background: var(--neutral-100);
  transition: border-color 0.4s linear;

  &:focus {
    outline: none;
    border-color: var(--theme-color);
    box-shadow: 0 0 0 3px rgba(32, 201, 151, 0.1);
  }
}

.login-button {
  background: var(--theme-color);
  //color: var(--neutral-50);
  border: none;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: var(--neutral-300);
    cursor: not-allowed;
  }
}
</style>