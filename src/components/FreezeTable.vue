<script lang="ts" setup>
import {computed} from 'vue'

interface TableColumn {
  key: string
  title: string
  width?: string
}

interface Props {
  headers: TableColumn[]
  rows: Record<string, any>[]
  freezeHeader?: boolean
  freezeFirstColumn?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  freezeHeader: true,
  freezeFirstColumn: true
})

const gridTemplate = computed(() => {
  return props.headers
      .map(col => col.width || 'minmax(150px, 1fr)')
      .join(' ')
})
</script>

<template>
  <div class="freeze-table-container">
    <div
        :style="{ 'grid-template-columns': gridTemplate }"
        class="freeze-table"
    >
      <!-- 表头 -->
      <div
          v-for="(col, index) in headers"
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
      <template v-for="(row, rowIndex) in rows" :key="rowIndex">
        <div
            v-for="(col, colIndex) in headers"
            :key="col.key"
            :class="{
            'freeze-col': freezeFirstColumn && colIndex === 0,
            'freeze-row': freezeHeader
          }"
            class="body-cell"
        >
          {{ row[col.key] }}
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
  box-shadow: 0 2px 4px rgba(var(--color-box-shadow) / 0.1);
}

.freeze-col {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--neutral-50);
  box-shadow: 2px 0 4px rgba(var(--color-box-shadow) / 0.1);
}

.freeze-col.freeze-header {
  z-index: 3;
}

.body-cell.freeze-row {
  background: var(--neutral-50);
}
</style>