<script lang="ts" setup>
import type {TableColumn} from "@/components/UniversalTable"
import UniversalTable from "@/components/UniversalTable"
import {defineAsyncComponent, markRaw, ref} from "vue"
import {dataAPI} from "@/assets/scripts/api"
import {getOrder, getTranslation} from "./table_info.ts"


interface Props {
  table: string
}

const props: Props = defineProps<Props>()


const columns = ref<TableColumn[]>([])
const tableData = ref<Record<string, any>[]>([])
const rowReadonly = ref<Record<number, boolean>>({})


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
  columns.value.push({
    key: 'actions',
    title: '操作',
    fieldType: 'custom',
    width: 'max-content',
    customComponent: markRaw(defineAsyncComponent(() => import('./RowActions.vue')))
  })
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
  if (tableData.value[rowId].actions?.deletedId === undefined) {
    tableData.value[rowId].actions.deletedId = tableData.value[rowId].id
    tableData.value[rowId].id = "✕"
    return
  }
  tableData.value[rowId].id = tableData.value[rowId].actions.deletedId
  delete tableData.value[rowId].actions.deletedId
}

async function fetchData() {
  const data = await dataAPI.getRows(props.table, 0, 1000)
  data.rows.forEach(row => {
    const index = row.id - 1
    // noinspection JSUnusedGlobalSymbols
    row.actions = {
      edit: () => switchEditable(index),
      delete: () => switchDelete(index)
    }
  })
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
    actions: {
      edit: () => switchEditable(index),
      delete: () => switchDelete(index)
    }
  })
  columns.value.forEach(column => {
    if (!['actions', 'id'].includes(column.key)) {
      tableData.value[index][column.key] = ""
    }
  })
  rowReadonly.value[index] = false
}
</script>

<template>
  <div class="header">
    <h1>{{ props.table[0].toUpperCase() + props.table.slice(1) }}</h1>
    <button @click="handleAddRow">新增行</button>
  </div>
  <UniversalTable
      v-model="tableData"
      :allow-drag-transpose="true"
      :allow-header-drag="true"
      :allow-row-drag="true"
      :column-order="getOrder(props.table)"
      :columns="columns"
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
</style>