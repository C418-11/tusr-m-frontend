<script lang="ts" setup>
import ThemeSwitcher from "@/components/base/ThemeSwitcher.vue";
import Background from '@/components/base/Background.vue';
import Notification from '@/components/base/Notification.vue';
import UserProfile from "@/components/base/UserProfile.vue";
import BackButton from "@/components/base/BackButton.vue";
import {onMounted} from "vue";

onMounted(() => {
  setTimeout(() => {
    showNotification('欢迎使用本系统！');
  }, 500);
});
</script>

<template>
  <Background/>
  <Notification/>
  <ThemeSwitcher/>
  <UserProfile/>
  <BackButton/>

  <router-view/>
</template>

<style scoped>
</style>
