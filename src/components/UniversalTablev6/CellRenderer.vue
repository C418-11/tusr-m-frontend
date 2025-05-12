<script lang="ts" setup>
import dayjs from 'dayjs'
import { type TableColumn } from './types'

defineProps<{
  column: TableColumn
  value: any
  readonly?: boolean
  pureText?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', value: any): void
}>()

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const handleUpdate = (value: any) => {
  emit('update', value)
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