<script lang="ts" setup>
import type {TableColumn} from "@/components/UniversalTable"
import UniversalTable from "@/components/UniversalTable"
import {defineAsyncComponent, markRaw, ref} from "vue";
import {dataAPI} from "@/assets/scripts/api";
import {reOrder, getTranslation} from "@/components/EditableDataTable/table_info.ts";


interface Props {
  table: string
}

const props: Props = defineProps<Props>()


const columns = ref<TableColumn[]>([])
const tableData = ref<Record<string, any>[]>([])
const columnOrder = ref<string[]>([])
const rowReadonly = ref<Record<string, boolean>>({name: true})  // todo


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
    }
    if (value.type === 'DATE') {
      column.fieldType = 'date'
    }
    if (value.type === 'BOOLEAN') {
      column.fieldType = 'select'
      column.options = [{label: "是", value: true}, {label: "否", value: false}]
    }
    if (value.type.includes('VARCHAR')) {
      column.fieldType = 'text'
    }
    if (value.primary_key) {
      column.fieldType = 'pure-text'
      column.width = 'min-content'
    }
    columns.value.push(column)
    columnOrder.value.push(key)
  }
}

fetchColumns()


async function fetchData() {
  const data = await dataAPI.getRows(props.table, 0, 1000)
  data.rows.forEach(row => {
    row.actions = {
      edit: () => console.log("edit"),
      delete: () => console.log("delete")
    }
  })
  tableData.value = data.rows
}

fetchData()

function handleAddRow() {
  tableData.value.push({})
}
</script>

<template>
  <div class="header">
    <h1>{{ props.table[0].toUpperCase() + props.table.slice(1) }}</h1>
    <button @click="handleAddRow">新增行</button>
  </div>
  <UniversalTable
      class="table"
      v-model="tableData"
      :allow-drag-transpose="true"
      :allow-header-drag="true"
      :allow-row-drag="true"
      :column-order="reOrder(props.table, columnOrder)"
      :readonly-rows="rowReadonly"
      :columns="columns"
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
  padding: .4em
  border-radius: 10px
</style>