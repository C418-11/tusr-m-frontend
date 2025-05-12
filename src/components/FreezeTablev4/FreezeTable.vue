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
  pureText?: boolean
  allowHeaderDrag?: boolean
  allowColumnDrag?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  freezeHeader: true,
  freezeFirstColumn: true,
  columnOrder: () => [],
  readonly: false,
  pureText: false,
  allowHeaderDrag: false,
  allowColumnDrag: false
})

const emit = defineEmits(['update:modelValue', 'update:columnOrder'])

// 处理列顺序
const orderedColumns = ref<TableColumn[]>([])

// 初始化列顺序
const updateOrderedColumns = () => {
  if (props.columnOrder.length === 0) {
    orderedColumns.value = [...props.columns]
    return
  }
  orderedColumns.value = [...props.columns].sort(
      (a, b) => props.columnOrder!.indexOf(a.key) - props.columnOrder!.indexOf(b.key)
  )
}

// 监听props变化
watch(() => [props.columns, props.columnOrder], () => {
  updateOrderedColumns()
}, { immediate: true, deep: true })

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

// 列拖动相关逻辑
const colDragStartIndex = ref(-1)
const colDragOverIndex = ref(-1)

function handleHeaderDragStart(e: DragEvent, index: number) {
  if (!props.allowHeaderDrag) return
  colDragStartIndex.value = index
  e.dataTransfer?.setData("text/plain", "header")
}

function handleHeaderDragOver(e: DragEvent, index: number) {
  if (!props.allowHeaderDrag) return
  if (colDragStartIndex.value === -1) return
  e.preventDefault()
  colDragOverIndex.value = index
}

function handleHeaderDragEnd() {
  if (!props.allowHeaderDrag) return
  if (colDragStartIndex.value !== colDragOverIndex.value && colDragOverIndex.value !== -1) {
    // 生成新地列顺序
    const newOrder = orderedColumns.value.map(col => col.key)
    emit('update:columnOrder', newOrder) // 触发父组件更新
    // 本地立即更新
    const [moved] = orderedColumns.value.splice(colDragStartIndex.value, 1)
    orderedColumns.value.splice(colDragOverIndex.value, 0, moved)
  }
  colDragStartIndex.value = -1
  colDragOverIndex.value = -1
}

// 行拖动相关逻辑
const rowDragStartIndex = ref(-1)
const rowDragOverIndex = ref(-1)

function handleRowDragStart(e: DragEvent, index: number) {
  if (!props.allowColumnDrag) return
  rowDragStartIndex.value = index
  e.dataTransfer?.setData("text/plain", "row")
}

function handleRowDragOver(e: DragEvent, index: number) {
  if (!props.allowColumnDrag) return
  if (rowDragStartIndex.value === -1) return
  e.preventDefault()
  rowDragOverIndex.value = index
}

function handleRowDragEnd() {
  if (!props.allowColumnDrag) return
  if (rowDragStartIndex.value !== rowDragOverIndex.value && rowDragOverIndex.value !== -1) {
    const newData = [...localData.value]
    const [moved] = newData.splice(rowDragStartIndex.value, 1)
    newData.splice(rowDragOverIndex.value, 0, moved)
    localData.value = newData
    emit('update:modelValue', newData)
  }
  rowDragStartIndex.value = -1
  rowDragOverIndex.value = -1
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
          'drag-over': allowHeaderDrag && colDragOverIndex === index,
          'freeze-header': freezeHeader,
          'freeze-col': freezeFirstColumn && index === 0
        }"
          :draggable="allowHeaderDrag"
          class="header-cell"
          @dragend="handleHeaderDragEnd"
          @dragover="handleHeaderDragOver($event, index)"
          @dragstart="handleHeaderDragStart($event, index)"
      >
        {{ col.title }}
      </div>

      <!-- 数据行 -->
      <template v-for="(row, rowIndex) in localData" :key="rowIndex">
        <div
            v-for="(col, colIndex) in orderedColumns"
            :key="col.key"
            :class="{
            'drag-over': (allowColumnDrag && rowDragOverIndex === rowIndex) || (allowHeaderDrag && colDragOverIndex === colIndex),
            'freeze-col': freezeFirstColumn && colIndex === 0,
            'freeze-row': freezeHeader
          }"
            :draggable="allowColumnDrag && colIndex === 0"
            class="body-cell"
            @dragend="handleRowDragEnd"
            @dragover="handleRowDragOver($event, rowIndex)"
            @dragstart="handleRowDragStart($event, rowIndex)"
        >
          <template v-if="col.fieldType === 'pure-text' || props.pureText">
            {{ row[col.key] }}
          </template>

          <template v-else-if="col.fieldType === 'text'">
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
  @include main.theme-transition("box-shadow .4s");

  &:last-child {
    border-right: none;
  }

  &.drag-over {
    box-shadow: inset 0 0 0 2px rgb(var(--theme-color));
  }
}

.header-cell {
  font-weight: 600;

  background: var(--neutral-100);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
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

  &.freeze-row {
    background: var(--neutral-50);
  }
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
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &.freeze-header {
    z-index: 3;
  }
}
</style>