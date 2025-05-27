<script lang="ts" setup>
interface Handlers {
  edit: () => void
  delete: () => void
  deletedId?: number
  diffStatus?: string
}

defineProps<{
  value: Handlers
  readonly?: boolean
}>()

</script>

<template>
  <div class="table-actions">
    <button
        :data-readonly="readonly"
        :disabled="value?.deletedId !== undefined"
        class="edit-btn"
        @click="value.edit"
    >{{ readonly ? "编辑" : "取消" }}
    </button>
    <button
        :data-deleted="value?.deletedId !== undefined"
        class="delete-btn"
        @click="value.delete"
    >{{ value?.deletedId ? "还原" : "删除" }}
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

      &[data-readonly="true"]
        background: var(--color-success)

      &:disabled
        background: var(--color-processing)

    &.delete-btn
      background: var(--color-error)

      &[data-deleted="true"]
        background: var(--color-info)
</style>