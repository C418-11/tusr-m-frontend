<script lang="ts" setup>
import dayjs from 'dayjs'
import { type TableColumn } from './types'
import {debounce} from 'lodash'
import {onUnmounted, shallowRef} from 'vue'

const props = defineProps<{
  column: TableColumn
  value: any
  readonly?: boolean
  pureText?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', value: any): void
}>()

// 内部缓存值
const internalValue = shallowRef(props.value)

// 防抖更新
const emitUpdate = debounce((value: any) => {
  emit('update', value)
}, 500)

onUnmounted(() => {
  emitUpdate.flush()
  emitUpdate.cancel()
})

// 统一处理更新逻辑
const handleUpdate = (value: any) => {
  // 立即更新内部值
  internalValue.value = value
  // 触发防抖更新
  emitUpdate(value)
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<template>
  <template v-if="column.fieldType === 'pure-text' || pureText">
    {{ value }}
  </template>

  <template v-else-if="column.fieldType === 'text'">
    <input
        :readonly="column.readonly || readonly"
        :value="value"
        type="text"
        @input="handleUpdate(($event.target as HTMLInputElement).value)"
    />
  </template>

  <template v-else-if="column.fieldType === 'number'">
    <input
        :readonly="column.readonly || readonly"
        :value="value"
        type="number"
        @input="handleUpdate(Number(($event.target as HTMLInputElement).value))"
    />
  </template>

  <template v-else-if="column.fieldType === 'select'">
    <select
        :disabled="column.readonly || readonly"
        :value="value"
        @change="handleUpdate(($event.target as HTMLSelectElement).value)"
    >
      <option
          v-for="option in column.options"
          :key="option.value"
          :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </template>

  <template v-else-if="column.fieldType === 'date'">
    <input
        :readonly="column.readonly || readonly"
        :value="formatDate(value)"
        type="date"
        @change="handleUpdate(($event.target as HTMLInputElement).value)"
    />
  </template>

  <template v-else-if="column.fieldType === 'custom'">
    <slot
        :name="`custom-${column.key}`"
        :value="value"
        :update="handleUpdate"
    >
      <component
          :is="column.customComponent"
          :value="value"
          :readonly="readonly"
          @update:value="handleUpdate"
      />
    </slot>
  </template>
</template>

<style lang="scss" scoped>
input, select {
  width: 100%;
  height: 100%;
  padding: .5rem;
  border-radius: .25rem;
}

select {
  cursor: pointer;
}
</style>