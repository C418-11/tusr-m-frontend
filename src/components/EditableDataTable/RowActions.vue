<script lang="ts" setup>


interface Handlers {
  edit: () => void
  delete: () => void
}


defineProps<{
  value: Handlers
  readonly?: boolean
}>()

</script>

<template>
  <div class="table-actions">
    <button
        v-if="!readonly"
        class="edit-btn"
        @click="value.edit"
    >编辑
    </button>
    <button
        class="delete-btn"
        @click="value.delete"
    >删除
    </button>
  </div>
</template>

<style lang="sass" scoped>
.table-actions
  display: flex
  gap: 0.5rem

  button
    padding: 0.25rem 0.5rem
    border-radius: 4px
    font-size: 0.9em

    &.edit-btn
      background: var(--color-warning)

    &.delete-btn
      background: var(--color-error)
</style>