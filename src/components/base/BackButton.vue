<script lang="ts" setup>
import router from "@/router"

const handleBack = () => {
  if (window.history.state.back) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="back-button-container no-select-no-drag" @click="handleBack">
    <svg class="back-icon" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/main";

.back-button-container {
  position: fixed;
  top: .6rem;
  left: .6rem;
  z-index: 9997;
  cursor: pointer;
  padding: 0.8rem;
  border-radius: 50%;
  background: var(--neutral-50);
  box-shadow: 0 0.25rem 1rem rgba(var(--color-box-shadow) / 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  @include main.theme-transition("transform .4s linear");

  &:active {
    transform: scale(0.90);
  }
}

.back-icon {
  width: 1.6rem;
  height: 1.6rem;
  color: var(--neutral-900);
  display: block;

  @include main.theme-transition;
}
</style>