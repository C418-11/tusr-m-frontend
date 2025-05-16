<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {authAPI} from '@/assets/scripts/api'
import type {Account, APIError, Role} from "@/assets/scripts/api/types"


enum EditMode {
  CREATE,
  EDIT
}


// 响应式数据
const accounts = ref<Account[]>([])
const roles = ref<Role[]>([])
const isLoading = ref(true)
const showEditDialog = ref(false)
const waitingForResponse = ref(false)
const editMode = ref<EditMode | null>(null)


interface EditAccount {
  id?: string
  username: string
  password: string
  roles: string[]
  active: boolean
}


// 表单数据
const editAccount = ref<EditAccount>({
  username: '',
  password: '',
  roles: [],
  active: true
})

// 初始化数据
onMounted(async () => {
  try {
    const [accountsRes, rolesRes] = await Promise.all([
      authAPI.getAccounts(),
      authAPI.getRoles()
    ])

    accounts.value = accountsRes.accounts
    roles.value = rolesRes.roles
  } catch (error) {
    handleError(error as APIError)
  } finally {
    isLoading.value = false
  }
})


function validationAccount(optional_password?: boolean) {
  if (!editAccount.value.username) {
    showNotification('用户名不能为空', 'warning')
    return
  }
  if (editAccount.value.username.length < 3 || editAccount.value.username.length > 16) {
    showNotification('用户名长度必须介于 3 到 16', 'warning')
    return
  }

  if ((!optional_password) || editAccount.value.password) {
    if (!editAccount.value.password) {
      showNotification('密码不能为空', 'warning')
      return
    }
    if (editAccount.value.password.length < 6 || editAccount.value.password.length > 16) {
      showNotification('密码长度必须介于 6 到 16', 'warning')
      return
    }
  }
  return true
}


function handleCancel() {
  editAccount.value = {
    username: '',
    password: '',
    roles: [],
    active: true
  }
  showEditDialog.value = false
  editMode.value = null
}


// 创建账户
async function handleCreate() {
  if (editAccount.value.id) {
    showNotification('请先关闭当前编辑对话框', 'warning')
    return
  }
  if (!validationAccount()) {
    return
  }
  if (waitingForResponse.value) {
    showNotification('请等待当前操作完成', 'processing')
    return
  }
  waitingForResponse.value = true

  try {
    await authAPI.createAccount(editAccount.value)
    showNotification('账户创建成功', 'success')
    await refreshAccounts()
    showEditDialog.value = false
  } catch (error) {
    handleError(error as APIError)
  }
  waitingForResponse.value = false
  handleCancel()
}

// 更新账户
async function handleUpdate() {
  if (!editAccount.value?.id) {
    showNotification('请选择要更新的账户', 'warning')
    return
  }
  if (!validationAccount(true)) {
    return
  }
  if (waitingForResponse.value) {
    showNotification('请等待当前操作完成', 'processing')
    return
  }

  waitingForResponse.value = true
  try {
    let userData: {
      id?: string
      username: string
      password?: string
      roles: string[]
      active: boolean
    } = JSON.parse(JSON.stringify(editAccount.value))
    delete userData.id
    if (!userData.password) {
      delete userData.password
    }

    await authAPI.updateAccount(editAccount.value.id, userData)
    showNotification('账户更新成功', 'success')
    await refreshAccounts()
    showEditDialog.value = false
  } catch (error) {
    handleError(error as APIError)
  }
  waitingForResponse.value = false
  handleCancel()
}

// 删除账户
async function handleDelete(accountId: string) {
  if (!confirm('确定要删除此账户吗？')) return

  try {
    await authAPI.deleteAccount(accountId)
    showNotification('账户删除成功', 'success')
    await refreshAccounts()
  } catch (error) {
    handleError(error as APIError)
  }
}

// 刷新账户列表
async function refreshAccounts() {
  try {
    const res = await authAPI.getAccounts()
    accounts.value = res.accounts
  } catch (error) {
    handleError(error as APIError)
  }
}

// 错误处理
function handleError(error: APIError) {
  showNotification(error.message || '操作失败', 'error')
}

// 打开编辑对话框
function openEditDialog(account: Account) {
  if (editMode.value) {
    showNotification('请先关闭当前编辑对话框', 'warning')
    return
  }
  editAccount.value = {
    id: account.id,
    password: '',
    username: account.username,
    roles: [...account.roles],
    active: account.active
  }
  showEditDialog.value = true
  editMode.value = EditMode.EDIT
}

function openCreateDialog() {
  if (editMode.value !== null) {
    showNotification('请先关闭当前编辑对话框', 'warning')
    return
  }
  editAccount.value = {
    username: '',
    password: '',
    roles: [],
    active: true
  }
  showEditDialog.value = true
  editMode.value = EditMode.CREATE
}
</script>

<template>
  <div class="view-container">
    <div class="view-card view-content-container">
      <div class="header">
        <h1 class="text-2xl font-bold">账户管理</h1>
        <button
            :disabled="editMode!==null"
            :title="editMode !== null ? '请先关闭当前编辑对话框' : ''"
            class="create-btn"
            @click="openCreateDialog"
        >
          新建账户
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading">加载中...</div>

      <!-- 账户表格 -->
      <table v-else class="account-table">
        <thead>
        <tr>
          <th>用户名</th>
          <th>角色</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="account in accounts" :key="account.id">
          <td>{{ account.username }}</td>
          <td>
              <span
                  v-for="role in account.roles"
                  :key="role"
                  class="role-tag"
              >
                {{ role }}
              </span>
          </td>
          <td>
              <span :class="['status', account.active ? 'active' : 'inactive']">
                {{ account.active ? '激活' : '禁用' }}
              </span>
          </td>
          <td class="actions">
            <button @click="openEditDialog(account)">编辑</button>
            <button
                class="delete"
                @click="handleDelete(account.id)"
            >
              删除
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- 编辑账户对话框 -->
      <dialog v-if="showEditDialog" class="dialog">
        <div class="dialog-content">
          <h2>
            {{ editMode === EditMode.CREATE ? '创建账户' : '编辑账户' }}
          </h2>
          <div class="form-group">
            <label>用户名</label>
            <input
                v-model="editAccount.username"
                :disabled="editMode!=EditMode.CREATE"
                :title="editMode!=EditMode.CREATE ? '用户名不可更改' : ''"
                placeholder="请输入用户名"
                type="text"
            >
          </div>
          <div class="form-group">
            <label>密码</label>
            <input
                v-model="editAccount.password"
                :placeholder="editMode  === EditMode.CREATE ? '请输入密码' : '可选项，填充以重置密码'"
                type="text"
            >
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="editAccount.roles" multiple title="可按住Ctrl或拖动多选">
              <option
                  v-for="role in roles"
                  :key="role.name"
                  :value="role.name"
              >
                {{ role.name }}
              </option>
            </select>
          </div>
          <div class="form-group checkbox">
            <label>激活账户</label>
            <select v-model="editAccount.active">
              <option :value="true">激活</option>
              <option :value="false">禁用</option>
            </select>
          </div>
          <div class="dialog-actions">
            <button @click="handleCancel">取消</button>
            <button
                :data-disabled="waitingForResponse"
                @click="editMode  === EditMode.CREATE ? handleCreate() : handleUpdate()"
            >
              {{ editMode === EditMode.CREATE ? '创建' : '更新' }}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/main";

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;

  &:hover {
    opacity: 0.9;
  }
}

.account-table {
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--neutral-200);

    @include main.theme-transition;
  }

  .role-tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    margin: 0.25rem;
    border-radius: 1rem;
    background: var(--neutral-100);
    color: var(--neutral-700);

    @include main.theme-transition;
  }

  .status {
    padding: .2rem .6rem;
    border-radius: .5rem;

    @include main.theme-transition("background-color 1s");

    &.active {
      background: var(--color-success);
      color: var(--neutral-50);

    }

    &.inactive {
      background: var(--color-error);
      color: var(--neutral-50);
    }
  }

  .actions {
    button {
      padding: 0.4rem .8rem;
      margin: 0.3rem;
      border-radius: 0.25rem;

      &.delete {
        background: var(--color-error);
      }
    }
  }
}

.dialog {
  &-content {
    background: var(--neutral-50);
    padding: 2rem;
    border-radius: 1rem;
    width: 500px;

    @include main.theme-transition;
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
    }

    input, select {
      width: 100%;
      border-radius: 0.5rem;
      padding: 0.75rem;
    }

    select[multiple] {
      option {
        padding: 0.5em;
        margin: 0.3em;
        border-radius: 0.5em;
      }
    }

    &.checkbox {
      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }

  &-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;

    button {
      border-radius: 0.5rem;
      padding: .5rem 1rem;
    }
  }
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--neutral-500);
  cursor: progress;
}
</style>
