<script lang="ts" setup>
import FreezeTable from '@/components/FreezeTable.vue'

const headers = [
  {key: 'name', title: '姓名', width: '200px'},
  {key: 'age', title: '年龄'},
  {key: 'department', title: '部门'},
  {key: 'position', title: '职位'},
  {key: 'salary', title: '薪资'},
  {key: 't1', title: 'Test1'},
  {key: 't2', title: 'Test2'},
  {key: 't3', title: 'Test3'},
  {key: 't4', title: 'Test4'},
  {key: 't5', title: 'Test5'},
  {key: 't6', title: 'Test6'},
  {key: 't7', title: 'Test7'},
  {key: 't8', title: 'Test8'},
  {key: 't9', title: 'Test9'},
  {key: 't10', title: 'Test10'}
]

const rows = Array.from({length: 50}, (_, i) => ({
  name: `用户 ${i + 1}`,
  age: 25 + (i % 5),
  department: ['技术部', '市场部', '财务部', '人事部'][i % 4],
  position: ['工程师', '经理', '主管', '专员'][i % 4],
  salary: 10000 + (i % 10) * 1000,
  t1: 'T1$'+i,
  t2: 'T2$'+i,
  t3: 'T3$'+i,
  t4: 'T4$'+i,
  t5: 'T5$'+i,
  t6: 'T6$'+i,
  t7: 'T7$'+i,
  t8: 'T8$'+i,
  t9: 'T9$'+i,
  t10: 'T10$'+i
}))
</script>

<template>
  <div class="view-container">
    <div class="view-card view-content-container">
      <h1 class="text-neutral-900">冻结表格测试</h1>
      <FreezeTable
          :headers="headers"
          :rows="rows"
          class="test-table"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.test-table {
  max-height: 60vh;
  margin-top: 2rem;
}
</style>