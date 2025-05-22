<script lang="ts" setup>

const props = defineProps({
  value: {
    type: String,
    default: 'active'
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()

const toggleStatus = () => {
  const newStatus = props.value === 'active' ? 'inactive' : 'active'
  emit('update:value', newStatus)
}
</script>

<template>
  <button
      :class="value"
      :disabled="readonly"
      class="status-button"
      @click="toggleStatus"
  >
    {{ value === 'active' ? '激活' : '禁用' }}
  </button>
</template>

<style lang="sass" scoped>
.status-button
  padding: 4px 12px
  border: none
  border-radius: 4px
  cursor: pointer
  transition: all 0.3s

  &:disabled
    cursor: not-allowed
    opacity: 0.5

.status-button.active
  background-color: #4CAF50
  color: white

.status-button.inactive
  background-color: #f44336
  color: white
</style>