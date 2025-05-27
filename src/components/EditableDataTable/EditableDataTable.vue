<script lang="ts" setup>
import type {TableColumn} from "@/components/UniversalTable"
import UniversalTable from "@/components/UniversalTable"
import {defineAsyncComponent, markRaw, ref} from "vue"
import {APICode, dataAPI} from "@/assets/scripts/api"
import {getOrder, getTranslation} from "./table_info.ts"
import type {APIArgumentError, APIError} from "@/assets/scripts/api/types";


interface Props {
  table: string
}

const props: Props = defineProps<Props>()


enum DiffStatus {
  add,
  delete,
  update,
  none
}


// 帮我写一个差异管理器，记录增删改的行号，通过快捷方法快速更新差异（如增3，删3则不记录3）
class DifferenceManager {
  add: Set<number>
  delete: Set<number>
  update: Set<number>

  constructor() {
    this.add = new Set<number>()
    this.delete = new Set<number>()
    this.update = new Set<number>()
  }

  addRow(rowId: number) {
    this.add.add(rowId)
    this.delete.delete(rowId)
    this.update.delete(rowId)
  }

  deleteRow(rowId: number) {
    if (!this.add.has(rowId)) {
      this.delete.add(rowId)
    }
    this.add.delete(rowId)
    this.update.delete(rowId)
  }

  updateRow(rowId: number) {
    if (!this.add.has(rowId)) {
      this.update.add(rowId)
    }
    this.add.delete(rowId)
    this.delete.delete(rowId)
  }

  clear() {
    this.add.clear()
    this.delete.clear()
    this.update.clear()
  }

  isAdd(rowId: number) {
    return this.add.has(rowId)
  }

  isDelete(rowId: number) {
    return this.delete.has(rowId)
  }

  isUpdate(rowId: number) {
    return this.update.has(rowId)
  }

  getStatus(rowId: number) {
    if (this.isAdd(rowId)) {
      return DiffStatus.add
    }
    if (this.isDelete(rowId)) {
      return DiffStatus.delete
    }
    if (this.isUpdate(rowId)) {
      return DiffStatus.update
    }
    return DiffStatus.none
  }

  setStatus(rowId: number, status: DiffStatus) {
    if (status === DiffStatus.add) {
      this.addRow(rowId)
    }
    if (status === DiffStatus.delete) {
      this.deleteRow(rowId)
    }
    if (status === DiffStatus.update) {
      this.updateRow(rowId)
    }
    if (status === DiffStatus.none) {
      this.add.delete(rowId)
      this.delete.delete(rowId)
      this.update.delete(rowId)
    }
  }
}


const columns = ref<TableColumn[]>([])
const tableData = ref<Record<string, any>[]>([])
const rowReadonly = ref<Record<number, boolean>>({})
const rowDiff = new DifferenceManager()
const waiting = ref(false)


function idSorter(a: string | number, b: string | number) {
  if (typeof a === "string") {
    return a.localeCompare(b as string)
  }
  return a - (b as number)
}

function stringSorter(a: string, b: string) {
  return a?.localeCompare(b)
}


function numberSorter(a: number, b: number) {
  return a - b
}


function booleanSorter(a: boolean, _: boolean) {
  return a ? 1 : -1
}


async function fetchColumns() {
  const data = await dataAPI.getTable(props.table)
  if (data[props.table]) {
    showNotification('未知的数据表', 'error')
    return
  }
  columns.value = [{
    key: '$actions',
    title: '操作',
    fieldType: 'custom',
    width: 'max-content',
    customComponent: markRaw(defineAsyncComponent(() => import('./RowActions.vue')))
  }]
  for (const [key, value] of Object.entries(data.tables[props.table])) {
    let column: TableColumn = {
      key: key,
      title: getTranslation(props.table, key),
      fieldType: 'pure-text',
    }
    if (value.type === 'INTEGER') {
      column.fieldType = 'number'
      column.sort = numberSorter
    }
    if (value.type === 'DATE') {
      column.fieldType = 'date'
    }
    if (value.type === 'BOOLEAN') {
      column.fieldType = 'select'
      column.options = [{label: "是", value: true}, {label: "否", value: false}]
      column.sort = booleanSorter
    }
    if (value.type.includes('VARCHAR')) {
      column.fieldType = 'text'
      column.sort = stringSorter
    }
    if (value.primary_key) {
      column.fieldType = 'pure-text'
      column.width = 'min-content'
      column.sort = idSorter
    }
    columns.value.push(column)
  }
}

fetchColumns()


function switchEditable(rowId: number) {
  rowReadonly.value[rowId] = !rowReadonly.value[rowId]
}

function switchDelete(rowId: number) {
  rowReadonly.value[rowId] = true
  let row = tableData.value[rowId]

  if (row.$actions?.deletedId === undefined) {
    row.$actions.deletedId = row.id
    row.id = "✕"

    row.$actions.diffStatus = rowDiff.getStatus(rowId)
    rowDiff.deleteRow(rowId)
    return
  }
  row.id = row.$actions.deletedId
  rowDiff.setStatus(rowId, row.$actions.diffStatus)
  delete row.$actions.deletedId
  delete row.$actions.diffStatus
}

async function fetchData() {
  const data = await dataAPI.getRows(props.table, 0, 1000)
  data.rows.forEach(row => {
    const index = row.id - 1
    // noinspection JSUnusedGlobalSymbols
    row.$actions = {
      edit: () => switchEditable(index),
      delete: () => switchDelete(index)
    }
  })
  rowDiff.clear()
  tableData.value = data.rows
  for (let i = 0; i < tableData.value.length; i++) {
    rowReadonly.value[i] = true
  }
}

fetchData()

function handleAddRow() {
  const index = tableData.value.length
  tableData.value.push({
    id: "⭑",
    $actions: {
      edit: () => switchEditable(index),
      delete: () => switchDelete(index)
    }
  })
  columns.value.forEach(column => {
    if (!['$actions', 'id'].includes(column.key)) {
      tableData.value[index][column.key] = ""
    }
  })
  rowReadonly.value[index] = false
  rowDiff.addRow(index)
}

async function handleSubmit() {
  waiting.value = true
  for (const rowId of rowDiff.add) {
    const row = tableData.value[rowId]
    const copiedRow = JSON.parse(JSON.stringify(row))
    try {
      delete copiedRow.$actions
      delete copiedRow.id
      await dataAPI.createRow(props.table, copiedRow)
    } catch (error) {
      if ((error as APIError).code === APICode.APIArgumentError) {
        const args = (error as APIArgumentError).data.arguments
        for (const [arg, messages] of Object.entries(args)) {
          for (const message of messages) {
            showNotification(`${row.id}${arg}: ${message}`, 'error', '10s')
          }
        }
      } else {
        showNotification(`${row.id}: ${(error as APIError).message}`, 'error')
      }
    }
  }
  await fetchData()
  showNotification('已更新表格', 'success')
  waiting.value = false
}
</script>

<template>
  <div class="header">
    <h1>{{ props.table[0].toUpperCase() + props.table.slice(1) }}</h1>
    <div class="buttons">
      <button @click="handleAddRow">新增行</button>
      <button @click="handleSubmit">提交更改</button>
    </div>
  </div>
  <UniversalTable
      v-model="tableData"
      :allow-drag-transpose="true"
      :allow-header-drag="true"
      :allow-row-drag="true"
      :column-order="getOrder(props.table)"
      :columns="columns"
      :readonly="waiting"
      :readonly-rows="rowReadonly"
      class="table"
  />
</template>

<style lang="sass" scoped>
.header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 2rem

.table
  max-height: 65vh
  margin-top: 2rem

button
  padding: .5em
  border-radius: 7px

.buttons
  display: flex
  gap: .5rem

  justify-content: flex-end
  align-items: center
</style>