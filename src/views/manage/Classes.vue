<script lang="ts" setup>

import EditableDataTable from "@/components/EditableDataTable/EditableDataTable.vue";
</script>

<template>
  <div class="view-container">
    <div class="view-card view-content-container">
      <h1>班级管理</h1>
      <EditableDataTable
          class="table"
          table="students"
      />
    </div>
  </div>
</template>

<style lang="sass" scoped>
.table
  max-height: 65vh
  margin-top: 2rem
</style>