<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import {type TableColumn} from './types'
import CellRenderer from "./CellRenderer.vue"

// ------ Props -----------------------------------------
interface Props {
  modelValue: Record<string, any>[]
  columns: TableColumn[]
  columnOrder?: string[]

  freezeHeader?: boolean
  freezeFirstColumn?: boolean

  readonly?: boolean
  pureText?: boolean

  allowHeaderDrag?: boolean
  allowRowDrag?: boolean

  transpose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columnOrder: () => [],

  freezeHeader: true,
  freezeFirstColumn: true,

  readonly: false,
  pureText: false,

  allowHeaderDrag: false,
  allowRowDrag: false,

  transpose: false,
})

// ------ Emits -----------------------------------------
const emit = defineEmits(['update:modelValue', 'update:columnOrder'])

// ------ Data ------------------------------------------
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
}, {immediate: true, deep: true})

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
  if (props.transpose) {
    return [
      orderedColumns.value[0],
      ...transposedColumns.value
    ].map(() => 'minmax(150px, 1fr)').join(' ')
  }
  return orderedColumns.value.map(col => col.width || 'minmax(150px, 1fr)').join(' ')
})

// ------ Drag & Drop -----------------------------------
// 列拖动相关逻辑
const columnDragStartIndex = ref(-1)
const columnDragOverIndex = ref(-1)

function handleColumnDragStart(e: DragEvent, index: number) {
  if (props.transpose) {
    if (!props.allowRowDrag) return
  } else if (!props.allowHeaderDrag) return

  columnDragStartIndex.value = index
  e.dataTransfer?.setData("text/plain", "header")
}

function handleColumnDragOver(e: DragEvent, index: number) {
  if (props.transpose) {
    if (!props.allowRowDrag) return
  } else if (!props.allowHeaderDrag) return

  if (columnDragStartIndex.value === -1) return
  e.preventDefault()
  columnDragOverIndex.value = index
}

function handleColumnDragEnd() {
  if (props.transpose) {
    if (!props.allowRowDrag) return
  } else if (!props.allowHeaderDrag) return

  if (columnDragStartIndex.value !== columnDragOverIndex.value && columnDragOverIndex.value !== -1) {
    // 生成新地列顺序
    const newOrder = orderedColumns.value.map(col => col.key)
    emit('update:columnOrder', newOrder) // 触发父组件更新
    // 本地立即更新
    const [moved] = orderedColumns.value.splice(columnDragStartIndex.value, 1)
    orderedColumns.value.splice(columnDragOverIndex.value, 0, moved)
  }
  columnDragStartIndex.value = -1
  columnDragOverIndex.value = -1
}

// 行拖动相关逻辑
const rowDragStartIndex = ref(-1)
const rowDragOverIndex = ref(-1)

function handleRowDragStart(e: DragEvent, index: number) {
  if (props.transpose) {
    if (!props.allowHeaderDrag) return
  } else if (!props.allowRowDrag) return

  rowDragStartIndex.value = index
  e.dataTransfer?.setData("text/plain", "row")
}

function handleRowDragOver(e: DragEvent, index: number) {
  if (props.transpose) {
    if (!props.allowHeaderDrag) return
  } else if (!props.allowRowDrag) return

  if (rowDragStartIndex.value === -1) return
  e.preventDefault()
  rowDragOverIndex.value = index
}

function handleRowDragEnd() {
  if (props.transpose) {
    if (!props.allowHeaderDrag) return
  } else if (!props.allowRowDrag) return

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

// ------ Transpose -------------------------------------
// 转置数据转换
const transposedData = computed(() => {
  if (!props.transpose) return undefined

  // 获取转置前的第一列key
  const firstColumnKey = orderedColumns.value[0]?.key
  // 获取原始表头信息
  const originalHeaders = orderedColumns.value.map(col => ({
    ...col,
    columnConfig: col
  }))

  return originalHeaders.map(header => ({
    field: header.key,
    title: header.title,
    columnConfig: header.columnConfig,
    values: localData.value.map(row => row[firstColumnKey]), // 第一列的值作为转置后的列头
    data: localData.value.map(row => row[header.key]) // 实际数据值
  })).filter(header => header.field !== firstColumnKey) // 过滤掉转置前的第一列
})

// 转置后的列定义（使用第一列的值作为表头）
const transposedColumns = computed<TableColumn[]>(() => {
  if (!props.transpose) return []

  const firstColumn = orderedColumns.value[0]
  return localData.value.map((row) => ({
    ...firstColumn,
    id: Object.keys(row)[0],
    title: row[firstColumn?.key], // 使用第一列的值作为表头
  }))
})

// 处理转置数据更新
function handleTransposeUpdate(field: string, colIndex: number, value: any) {
  if (props.readonly) return
  const newData = [...localData.value]
  // 更新对应单元格数据
  newData[colIndex][field] = value
  localData.value = newData
  emit('update:modelValue', newData)
}
</script>

<template>
  <div class="freeze-table-container">
    <div
        :style="{ 'grid-template-columns': gridTemplate }"
        class="freeze-table"
    >
      <!-- 转置模式下的渲染 -->
      <template v-if="transpose">
        <!-- 左上角单元格 -->
        <div
            :class="{
              'drag-over': allowHeaderDrag && columnDragOverIndex === 0,
              'freeze-header': freezeHeader,
              'freeze-row': freezeFirstColumn
            }"
            :draggable="allowRowDrag"
            class="header-cell"
            @dragend="handleColumnDragEnd"
            @dragover="handleColumnDragOver($event, 0)"
            @dragstart="handleColumnDragStart($event, 0)"
        >
          {{ orderedColumns[0].title }}
        </div>
        <!-- 最左边固定列（原始表头） -->
        <template v-for="(col, colIndex) in transposedColumns" :key="col.id">
          <div
              :class="{
                'drag-over': allowHeaderDrag && rowDragOverIndex === colIndex,
                'freeze-header': freezeHeader
              }"
              :draggable="allowHeaderDrag"
              class="header-cell"
              @dragend="handleRowDragEnd"
              @dragover="handleRowDragOver($event, colIndex)"
              @dragstart="handleRowDragStart($event, colIndex)"
          >
            <CellRenderer
                :column="col"
                :pure-text="pureText"
                :readonly="transposedColumns[0].readonly || readonly"
                :value="col.title"
                @update="handleTransposeUpdate(col.key, colIndex, $event)"
            />
          </div>
        </template>

        <!-- 数据行 -->
        <template v-for="(row, rowIndex) in transposedData" :key="row.field">
          <div
              :class="{
                'freeze-row': freezeFirstColumn,
                'drag-over': allowRowDrag && columnDragOverIndex === rowIndex + 1,
              }"
              :draggable="allowRowDrag"
              class="body-cell"
              @dragend="handleColumnDragEnd"
              @dragover="handleColumnDragOver($event, rowIndex + 1)"
              @dragstart="handleColumnDragStart($event, rowIndex + 1)"
          >
            {{ row.title }}
          </div>
          <div
              v-for="(value, colIndex) in row.data"
              :key="colIndex"
              class="body-cell"
          >
            <CellRenderer
                :column="row.columnConfig"
                :pure-text="pureText"
                :readonly="row.columnConfig?.readonly || readonly"
                :value="value"
                @update="handleTransposeUpdate(row.field, colIndex, $event)"
            />
          </div>
        </template>
      </template>
      <!-- 原始模式下渲染 -->
      <template v-else>
        <!-- 表头 -->
        <div
            v-for="(col, colIndex) in orderedColumns"
            :key="col.key"
            :class="{
            'drag-over': allowHeaderDrag && columnDragOverIndex === colIndex,
            'freeze-header': freezeHeader,
            'freeze-row': freezeFirstColumn && colIndex === 0
          }"
            :draggable="allowHeaderDrag"
            class="header-cell"
            @dragend="handleColumnDragEnd"
            @dragover="handleColumnDragOver($event, colIndex)"
            @dragstart="handleColumnDragStart($event, colIndex)"
        >
          {{ col.title }}
        </div>

        <!-- 数据行 -->
        <template v-for="(row, rowIndex) in localData" :key="rowIndex">
          <div
              v-for="(col, colIndex) in orderedColumns"
              :key="col.key"
              :class="{
              'drag-over': (allowRowDrag && rowDragOverIndex === rowIndex) || (allowHeaderDrag && columnDragOverIndex === colIndex),
              'freeze-row': freezeFirstColumn && colIndex === 0,
            }"
              :draggable="allowRowDrag && colIndex === 0"
              class="body-cell"
              @dragend="handleRowDragEnd"
              @dragover="handleRowDragOver($event, rowIndex)"
              @dragstart="handleRowDragStart($event, rowIndex)"
          >
            <CellRenderer
                :column="col"
                :pure-text="pureText"
                :readonly="col.readonly || readonly"
                :value="row[col.key]"
                @update="updateValue(rowIndex, col.key, $event)"
            />
          </div>
        </template>
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
  min-width: fit-content;
}

.header-cell,
.body-cell {
  padding: 1rem;
  border-bottom: 1px solid var(--neutral-200);
  border-right: 1px solid var(--neutral-200);

  background: var(--neutral-50);

  @include main.theme-transition("box-shadow .4s");

  &:last-child {
    border-right: none;
  }

  &.drag-over {
    box-shadow: inset 0 0 0 2px rgb(var(--theme-color));
  }

  &[draggable="true"] {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }
}

.header-cell {
  font-weight: 600;

  background: var(--neutral-100);
}

.freeze-header {
  position: sticky;
  top: 0;
  z-index: 2;
}

.freeze-row {
  position: sticky;
  left: 0;
  z-index: 1;

  &.freeze-header {
    z-index: 3;
  }
}
</style>