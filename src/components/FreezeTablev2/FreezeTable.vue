<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import dayjs from 'dayjs'
import {type TableColumn} from './types'

interface Props {
  columns: TableColumn[]
  modelValue: Record<string, any>[]
  columnOrder?: string[]
  freezeHeader?: boolean
  freezeFirstColumn?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  freezeHeader: true,
  freezeFirstColumn: true,
  columnOrder: () => [],
  readonly: false
})

const emit = defineEmits(['update:modelValue'])

// 处理列顺序
const orderedColumns = computed(() => {
  if (props.columnOrder.length === 0) return props.columns
  return [...props.columns].sort(
      (a, b) => props.columnOrder.indexOf(a.key) - props.columnOrder.indexOf(b.key)
  )
})

// 数据同步
const localData = ref([...props.modelValue])
watch(() => props.modelValue, (val) => {
  localData.value = [...val]
})

function updateValue(rowIndex: number, key: string, value: any) {
  if (props.readonly) return
  const newData = [...localData.value]
  newData[rowIndex][key] = value
  localData.value = newData
  emit('update:modelValue', newData)
}

// 网格模板计算
const gridTemplate = computed(() => {
  return orderedColumns.value
      .map(col => col.width || 'minmax(150px, 1fr)')
      .join(' ')
})

// 日期格式处理
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<template>
  <div class="freeze-table-container">
    <div
        :style="{ 'grid-template-columns': gridTemplate }"
        class="freeze-table"
    >
      <!-- 表头 -->
      <div
          v-for="(col, index) in orderedColumns"
          :key="col.key"
          :class="{
          'freeze-header': freezeHeader,
          'freeze-col': freezeFirstColumn && index === 0
        }"
          class="header-cell"
      >
        {{ col.title }}
      </div>

      <!-- 数据行 -->
      <template v-for="(row, rowIndex) in localData" :key="rowIndex">
        <div
            v-for="(col, colIndex) in orderedColumns"
            :key="col.key"
            :class="{
            'freeze-col': freezeFirstColumn && colIndex === 0,
            'freeze-row': freezeHeader
          }"
            class="body-cell"
        >
          <template v-if="col.fieldType === 'text'">
            <input
                :readonly="col.readonly || readonly"
                :value="row[col.key]"
                type="text"
                @input="updateValue(rowIndex, col.key, ($event.target as HTMLInputElement).value)"
            />
          </template>

          <template v-else-if="col.fieldType === 'number'">
            <input
                :readonly="col.readonly || readonly"
                :value="row[col.key]"
                type="number"
                @input="updateValue(rowIndex, col.key, Number(($event.target as HTMLInputElement).value))"
            />
          </template>

          <template v-else-if="col.fieldType === 'select'">
            <select
                :disabled="col.readonly || readonly"
                :value="row[col.key]"
                @change="updateValue(rowIndex, col.key, ($event.target as HTMLSelectElement).value)"
            >
              <option
                  v-for="option in col.options"
                  :key="option.value"
                  :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </template>

          <template v-else-if="col.fieldType === 'date'">
            <input
                :readonly="col.readonly || readonly"
                :value="formatDate(row[col.key])"
                type="date"
                @change="updateValue(rowIndex, col.key, ($event.target as HTMLInputElement).value)"
            />
          </template>

          <template v-else-if="col.fieldType === 'custom'">
            <slot
                :name="`custom-${col.key}`"
                :row="row"
                :update="(value: any) => updateValue(rowIndex, col.key, value)"
                :value="row[col.key]"
            >
              <component
                  :is="col.customComponent"
                  :value="row[col.key]"
                  @update:value="updateValue(rowIndex, col.key, $event)"
              />
            </slot>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/main";

.freeze-table-container {
  max-width: 100%;
  overflow: auto;
  border: 1px solid var(--neutral-200);
  border-radius: 0.5rem;
  @include main.theme-transition;
}

.freeze-table {
  display: grid;
  position: relative;
  background: var(--neutral-50);
  min-width: fit-content;
}

.header-cell,
.body-cell {
  padding: 1rem;
  border-bottom: 1px solid var(--neutral-200);
  border-right: 1px solid var(--neutral-200);
  @include main.theme-transition;

  &:last-child {
    border-right: none;
  }
}

.header-cell {
  background: var(--neutral-100);
  font-weight: 600;
}

.freeze-header {
  position: sticky;
  top: 0;
  z-index: 2;
}

.freeze-col {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--neutral-50);
}

.freeze-col.freeze-header {
  z-index: 3;
}

.body-cell.freeze-row {
  background: var(--neutral-50);
}

.body-cell {
  input, select {
    width: 100%;
    height: 100%;
    padding: .5rem;

    border-radius: .25rem;
  }

  select {
    cursor: pointer;
  }
}
</style>