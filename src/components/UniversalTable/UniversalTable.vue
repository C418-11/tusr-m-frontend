<script lang="ts" setup>
import {computed, ref, shallowRef, watch} from 'vue'
import {type TableColumn} from './types'
import CellRenderer from "./CellRenderer.vue"
import {throttle} from 'lodash'

// ------ Props -----------------------------------------
interface Props {
  modelValue: Record<string, any>[]
  columns: TableColumn[]
  columnOrder?: string[]

  freezeHeader?: boolean
  freezeFirstColumn?: boolean

  readonly?: boolean
  readonlyRows?: Record<number, boolean>
  pureText?: boolean
  pureTextRows?: Record<string, boolean>

  allowHeaderDrag?: boolean
  allowRowDrag?: boolean

  transpose?: boolean
  allowDragTranspose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columnOrder: () => [],

  freezeHeader: true,
  freezeFirstColumn: true,

  readonly: false,
  readonlyRows: () => ({} as Record<string, boolean>),
  pureText: false,
  pureTextRows: () => ({} as Record<string, boolean>),

  allowHeaderDrag: false,
  allowRowDrag: false,

  transpose: false,
  allowDragTranspose: false
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
const tableData = shallowRef(props.modelValue)
watch(props, () => {
  tableData.value = props.modelValue
})

function updateValue(rowIndex: number, key: string, value: any) {
  if (props.readonly) return
  const newData = [...tableData.value]
  newData[rowIndex][key] = value
  tableData.value = newData
  emit('update:modelValue', newData)
}

// 网格模板计算
const gridTemplate = computed(() => {
  if (transpose.value) {
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
  if (transpose.value) {
    if (!props.allowRowDrag) return
  } else if (!props.allowHeaderDrag) return

  columnDragStartIndex.value = index
  e.dataTransfer?.setData("text/plain", "header")
}

const _updateColumnDragOverIndex = throttle(
    (index: number) => columnDragOverIndex.value = index,
    100,
    {leading: true, trailing: true},
)

function handleColumnDragOver(e: DragEvent, index: number) {
  if (transpose.value) {
    if (!props.allowRowDrag) return
  } else if (!props.allowHeaderDrag) return

  if (!props.allowDragTranspose && columnDragStartIndex.value === -1) return

  e.preventDefault()
  _updateColumnDragOverIndex(index)
}

function handleColumnDragEnd() {
  if (transpose.value) {
    if (!props.allowRowDrag) return
  } else if (!props.allowHeaderDrag) return

  const hasDragged = columnDragStartIndex.value !== -1 && columnDragOverIndex.value !== -1
  const hasChanged = columnDragStartIndex.value !== columnDragOverIndex.value
  if (hasDragged && hasChanged) {
    // 生成新地列顺序
    const newOrder = orderedColumns.value.map(col => col.key)
    emit('update:columnOrder', newOrder) // 触发父组件更新
    // 本地立即更新
    const [moved] = orderedColumns.value.splice(columnDragStartIndex.value, 1)
    orderedColumns.value.splice(columnDragOverIndex.value, 0, moved)
  }
  if (props.allowDragTranspose && rowDragOverIndex.value !== -1) transpose.value = !transpose.value
  cleanupDrag()
}

// 行拖动相关逻辑
const rowDragStartIndex = ref(-1)
const rowDragOverIndex = ref(-1)

function handleRowDragStart(e: DragEvent, index: number) {
  if (transpose.value) {
    if (!props.allowHeaderDrag) return
  } else if (!props.allowRowDrag || sortState.value.direction !== 'none') return

  rowDragStartIndex.value = index
  e.dataTransfer?.setData("text/plain", "row")
}

const _updateRowDragOverIndex = throttle(
    (index: number) => rowDragOverIndex.value = index,
    100,
    {leading: true, trailing: true},
)

function handleRowDragOver(e: DragEvent, index: number) {
  if (transpose.value) {
    if (!props.allowHeaderDrag) return
  } else if (!props.allowRowDrag || sortState.value.direction !== 'none') return

  if (!props.allowDragTranspose && rowDragStartIndex.value === -1) return

  e.preventDefault()
  _updateRowDragOverIndex(index)
}

function handleRowDragEnd() {
  if (transpose.value) {
    if (!props.allowHeaderDrag) return
  } else if (!props.allowRowDrag || sortState.value.direction !== 'none') return

  const hasDragged = rowDragStartIndex.value !== -1 && rowDragOverIndex.value !== -1
  const hasChanged = rowDragStartIndex.value !== rowDragOverIndex.value
  if (hasDragged && hasChanged) {
    const newData = [...tableData.value]
    const [moved] = newData.splice(rowDragStartIndex.value, 1)
    newData.splice(rowDragOverIndex.value, 0, moved)
    tableData.value = newData
    emit('update:modelValue', newData)
  }
  if (props.allowDragTranspose && columnDragOverIndex.value !== -1) transpose.value = !transpose.value
  cleanupDrag()
}

function cleanupDrag() {
  columnDragStartIndex.value = -1
  columnDragOverIndex.value = -1
  rowDragStartIndex.value = -1
  rowDragOverIndex.value = -1

  _updateColumnDragOverIndex.cancel()
  _updateRowDragOverIndex.cancel()
}

// ------ Sort ------------------------------------------
const sortState = ref<{
  key: string
  direction: 'asc' | 'desc' | 'none'
}>({key: '', direction: 'none'})


const sortedData = computed(() => {
  if (props.transpose) return []  // 暂不支持转置模式下排序
  if (sortState.value.direction === 'none' || !sortState.value.key) {
    return tableData.value
  }

  const column = orderedColumns.value.find(col => col.key === sortState.value.key)
  if (!column?.sort) return tableData.value

  const compareFn = column.sort
  return [...tableData.value].sort((a, b) => {
    const result = compareFn(a[sortState.value.key], b[sortState.value.key])
    return sortState.value.direction === 'asc' ? result : -result
  })
})

function handleSortClick(col: TableColumn) {
  if (!col.sort) return // 无排序函数则不处理

  if (sortState.value.key === col.key) {
    // 同一列，切换方向
    const nextDirection = {
      'none': 'asc',
      'asc': 'desc',
      'desc': 'none',
    }[sortState.value.direction] as 'asc' | 'desc' | 'none'

    sortState.value = {
      key: nextDirection === 'none' ? '' : col.key,
      direction: nextDirection,
    }
  } else {
    // 新列，默认升序
    sortState.value = {
      key: col.key,
      direction: 'asc',
    }
  }
}

// ------ Transpose -------------------------------------
const transpose = ref(props.transpose)

watch(() => props.transpose, (newVal) => {
  transpose.value = newVal
})

// 转置数据转换
const transposedData = computed<Record<string, any>[]>(() => {
  if (!transpose.value) return []  // 非转置模式不处理

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
    values: tableData.value.map(row => row[firstColumnKey]), // 第一列的值作为转置后的列头
    data: tableData.value.map(row => row[header.key]) // 实际数据值
  })).filter(header => header.field !== firstColumnKey) // 过滤掉转置前的第一列
})

// 转置后的列定义（使用第一列的值作为表头）
const transposedColumns = computed<TableColumn[]>(() => {
  if (!transpose.value) return []

  const firstColumn = orderedColumns.value[0]
  return tableData.value.map((row) => ({
    ...firstColumn,
    id: Object.keys(row)[0],
    title: row[firstColumn?.key], // 使用第一列的值作为表头
  }))
})

// 处理转置数据更新
function handleTransposeUpdate(field: string, colIndex: number, value: any) {
  if (props.readonly) return
  const newData = [...tableData.value]
  // 更新对应单元格数据
  newData[colIndex][field] = value
  tableData.value = newData
  emit('update:modelValue', newData)
}

// ------ Utils -----------------------------------------
interface TitleOptionals {
  draggable?: boolean
  clickable?: boolean,
  frozen?: boolean
}

function freezeTitle(options: TitleOptionals) {
  let title: string[] = []
  if (options.draggable) title.push('可拖动')
  if (options.clickable) title.push('可排序')
  if (props.allowDragTranspose && props.allowHeaderDrag && props.allowRowDrag) title.push('可转置')
  if (options.frozen) title.push('固定列')
  return title.join('，')
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
            :title="freezeTitle({draggable: allowRowDrag})"
            class="header-cell"
            @dragend="handleColumnDragEnd"
            @dragover="handleColumnDragOver($event, 0)"
            @dragstart="handleColumnDragStart($event, 0)"
        >
          {{ orderedColumns[0].title }}
        </div>
        <!-- 表头（原最左侧固定列） -->
        <template v-for="(col, colIndex) in transposedColumns" :key="col.id">
          <div
              :class="{
                'drag-over': allowHeaderDrag && rowDragOverIndex === colIndex,
                'freeze-header': freezeHeader
              }"
              :draggable="allowHeaderDrag"
              :title="freezeTitle({draggable: allowHeaderDrag})"
              class="header-cell"
              @dragend="handleRowDragEnd"
              @dragover="handleRowDragOver($event, colIndex)"
              @dragstart="handleRowDragStart($event, colIndex)"
          >
            <template v-if="pureText || col.fieldType === 'pure-text' || props.pureTextRows[col.key]">
              {{ col.title }}
            </template>
            <CellRenderer
                v-else
                :column="col"
                :pure-text="pureText || props.pureTextRows[col.key]"
                :readonly="readonly || transposedColumns[0].readonly || props.readonlyRows[colIndex]"
                :value="col.title"
                @update="handleTransposeUpdate(col.key, colIndex, $event)"
            />
          </div>
        </template>

        <!-- 数据行 -->
        <template v-for="(row, rowIndex) in transposedData" :key="row.field">
          <!-- todo last-in-row last-in-column -->
          <div
              :class="{
                'freeze-row': freezeFirstColumn,
                'drag-over': allowRowDrag && columnDragOverIndex === rowIndex + 1,
              }"
              :draggable="allowRowDrag"
              :title="freezeTitle({draggable: allowRowDrag})"
              class="body-cell"
              @dragend="handleColumnDragEnd"
              @dragover="handleColumnDragOver($event, rowIndex + 1)"
              @dragstart="handleColumnDragStart($event, rowIndex + 1)"
          >
            {{ row.title }}
          </div>
          <div
              v-for="(value, colIndex) in row.data"
              :key="`row-${rowIndex}-col-${colIndex}`"
              :class="{
                'drag-over': (allowHeaderDrag && rowDragOverIndex === colIndex) || (allowRowDrag && columnDragOverIndex === rowIndex + 1),
              }"
              class="body-cell"
          >
            <template v-if="pureText || row.columnConfig.fieldType === 'pure-text' || props.pureTextRows[row.field]">
              {{ value }}
            </template>
            <CellRenderer
                v-else
                :key="`cell-${rowIndex}-${colIndex}`"
                :column="row.columnConfig"
                :pure-text="pureText || props.pureTextRows[row.field]"
                :readonly="readonly || row.columnConfig?.readonly || props.readonlyRows[colIndex]"
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
            'freeze-row': freezeFirstColumn && colIndex === 0,
            'sortable': col.sort,
            'last-in-row': colIndex === orderedColumns.length - 1,
            'last-in-column': sortedData.length === 0,
          }"
            :draggable="allowHeaderDrag"
            :title="freezeTitle({draggable: allowHeaderDrag, clickable: true})"
            class="header-cell"
            @click="handleSortClick(col)"
            @dragend="handleColumnDragEnd"
            @dragover="handleColumnDragOver($event, colIndex)"
            @dragstart="handleColumnDragStart($event, colIndex)"
        >
          {{ col.title }}
          <span v-if="col.sort" class="sort-arrow">
            <template v-if="sortState.key === col.key">
              {{ sortState.direction === 'asc' ? '↑' : '↓' }}
            </template>
            <template v-else>·</template>
          </span>
        </div>

        <!-- 数据行 -->
        <template v-for="(row, rowIndex) in sortedData" :key="rowIndex">
          <div
              v-for="(col, colIndex) in orderedColumns"
              :key="`row-${rowIndex}-col-${col.key}`"
              :class="{
              'drag-over': (allowRowDrag && rowDragOverIndex === rowIndex) || (allowHeaderDrag && columnDragOverIndex === colIndex),
              'freeze-row': freezeFirstColumn && colIndex === 0,
              'last-in-row': colIndex === orderedColumns.length - 1,
              'last-in-column': rowIndex === sortedData.length - 1,
            }"
              :draggable="allowRowDrag && colIndex === 0"
              :title="allowRowDrag && colIndex === 0 ? freezeTitle({draggable: true}) : ''"
              class="body-cell"
              @dragend="(allowRowDrag && colIndex === 0) ? handleRowDragEnd() : cleanupDrag()"
              @dragover="(allowRowDrag  && colIndex === 0) ? handleRowDragOver($event, rowIndex) : null"
              @dragstart="(allowRowDrag && colIndex === 0) ? handleRowDragStart($event, rowIndex) : null"
          >
            <template v-if="pureText || col.fieldType === 'pure-text' || props.pureTextRows[col.key]">
              {{ row[col.key] }}
            </template>
            <CellRenderer
                v-else
                :key="`cell-${rowIndex}-${col.key}`"
                :column="col"
                :pure-text="pureText || props.pureTextRows[col.key]"
                :readonly="readonly || col.readonly || props.readonlyRows[rowIndex]"
                :value="row[col.key]"
                @update="updateValue(rowIndex, col.key, $event)"
            />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@use "@/assets/styles/main"

.freeze-table-container
  max-width: 100%
  overflow: auto
  border: 1px solid var(--neutral-200)
  border-radius: 0.5rem
  @include main.theme-transition

.freeze-table
  display: grid
  position: relative
  min-width: fit-content

.header-cell,
.body-cell
  display: flex
  align-items: center
  justify-content: center

  padding: 1rem
  border-bottom: 1px solid var(--neutral-200)
  border-right: 1px solid var(--neutral-200)
  background: var(--neutral-50)
  @include main.theme-transition("box-shadow .4s")

  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis

  &.last-in-row
    border-right: none

  &.last-in-column
    border-bottom: none

  &.drag-over
    box-shadow: inset 0 0 0 2px rgb(var(--theme-color))

  &[draggable="true"]
    cursor: grab

    &:active
      cursor: grabbing

.header-cell
  font-weight: 600
  background: var(--neutral-100)

  &.sortable
    cursor: pointer

    &:active
      cursor: grabbing

  .sort-arrow
    margin-left: 0.1rem
    color: var(--theme-color)

.freeze-header
  position: sticky
  top: 0
  z-index: 2

.freeze-row
  position: sticky
  left: 0
  z-index: 1

  &.freeze-header
    z-index: 3
</style>