<script lang="ts" setup>
import {authAPI} from "@/assets/scripts/api"
import type {Account} from "@/assets/scripts/api/types"
import {ref} from "vue"

const user = ref<Account>()
const checking = ref(false)

async function fetchUser() {
  checking.value = true
  try {
    user.value = (await authAPI.whoami()).accounts[0]
  } catch (e) {
    user.value = undefined
  }
  checking.value = false
}

fetchUser()
</script>

<template>
  <div class="view-container">
    <div class="view-card">
      <!-- 横向排列的Group容器 -->
      <div class="groups-container">
        <div class="group-box">
          <h3 class="group-title">账户管理</h3>
          <div class="group-links">
            <template v-if="(user?.roles ?? []).includes('admin')">
              <router-link :to="{name: 'ManageAccounts'}">账户列表</router-link>
            </template>
            <template v-else-if="checking">正在检查登录状态...</template>
            <template v-else>未登录或权限不足</template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@use '@/assets/styles/main'

.groups-container
  display: flex
  gap: 2rem
  flex-wrap: wrap
  justify-content: center

.group-box
  border: 1px solid var(--neutral-200)
  border-radius: 6px
  padding: 1rem
  min-width: 220px
  max-height: fit-content
  background: var(--neutral-50)
  box-shadow: 0 0.2rem 0.4rem rgba(var(--color-box-shadow) / 0.05)
  @include main.theme-transition

.group-title
  margin: 0 0 1rem 0
  padding-bottom: 0.5rem
  border-bottom: 1px solid var(--neutral-200)
  color: var(--neutral-900)
  font-size: 1.1rem
  @include main.theme-transition

.group-links
  display: flex
  flex-direction: column
  gap: 0.75rem

  a
    text-decoration: none
    color: var(--neutral-700)
    padding: 0.25rem 0.5rem
    border-radius: 4px
    @include main.theme-transition("background-color .4s, color .4s")

    &:hover
      background: var(--neutral-100)
      color: rgba(var(--theme-color) / 0.8)

    &.router-link-exact-active
      background: rgba(var(--theme-color) / 0.9)
      color: var(--neutral-50)
</style>