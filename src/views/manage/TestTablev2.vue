<script lang="ts" setup>
import {ref} from 'vue'
import FreezeTable, {type TableColumn} from '@/components/FreezeTablev2'

interface User {
  name: string;
  status: string;
  birthday: string;
  t1: string;
  t2: string;
  t3: string;
  t4: string;
  t5: string;
  t6: string;
  t7: string;
  t8: string;
  t9: string;
  t10: string;
}

function generateUsers(count: number): User[] {
  const surnames = ['张', '李', '王', '赵', '孙', '钱', '周', '吴', '郑', '冯', '陈', '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '许'];
  const years = [1990, 1995, 1985, 1992, 1988, 1997, 1993, 1996, 1994];
  const months = [1, 5, 12, 6, 8, 7, 9, 10, 11, 2, 3, 4];

  return Array.from({length: count}, (_, i) => {
    const numberPart = i + 1;
    return {
      name: `${surnames[i % surnames.length]}${getChineseNumber(numberPart + 2)}`,
      status: i % 2 === 0 ? 'active' : 'inactive',
      birthday: generateBirthday(i, years, months),
      t1: `t1$${numberPart}`,
      t2: `t2$${numberPart}`,
      t3: `t3$${numberPart}`,
      t4: `t4$${numberPart}`,
      t5: `t5$${numberPart}`,
      t6: `t6$${numberPart}`,
      t7: `t7$${numberPart}`,
      t8: `t8$${numberPart}`,
      t9: `t9$${numberPart}`,
      t10: `t10$${numberPart}`,
    };
  });
}

function getChineseNumber(num: number): string {
  const chineseNumbers = [
    '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '二十一', '二十二'
  ];
  return num <= 22 ? chineseNumbers[num - 1] : num.toString();
}

function generateBirthday(i: number, years: number[], months: number[]): string {
  const year = years[i % years.length];
  const month = months[i % months.length];
  return `${year}-${month.toString().padStart(2, '0')}-${months.toString().padStart(2, '0')}`;
}

const columns: TableColumn[] = [
  {
    key: 'name',
    title: '姓名',
    fieldType: 'text',
    width: '200px'
  },
  {
    key: 'status',
    title: '状态',
    fieldType: 'select',
    options: [
      {label: '激活', value: 'active'},
      {label: '禁用', value: 'inactive'}
    ]
  },
  {
    key: 'birthday',
    title: '生日',
    fieldType: 'date'
  },
  {
    key: 't1',
    title: 't1',
    fieldType: 'text'
  },
  {
    key: 't2',
    title: 't2',
    fieldType: 'text'
  },
  {
    key: 't3',
    title: 't3',
    fieldType: 'text'
  },
  {
    key: 't4',
    title: 't4',
    fieldType: 'text'
  },
  {
    key: 't5',
    title: 't5',
    fieldType: 'text'
  },
  {
    key: 't6',
    title: 't6',
    fieldType: 'text'
  },
  {
    key: 't7',
    title: 't7',
    fieldType: 'text'
  },
  {
    key: 't8',
    title: 't8',
    fieldType: 'text'
  },
  {
    key: 't9',
    title: 't9',
    fieldType: 'text'
  },
  {
    key: 't10',
    title: 't10',
    fieldType: 'text'
  },
]

const tableData = ref(generateUsers(20));
</script>

<template>
  <div class="view-container">
    <div class="view-card view-content-container">
      <h1 class="text-neutral-900">冻结表格测试</h1>
      <FreezeTable
          v-model="tableData"
          :freeze-first-column="true"
          :columns="columns"
          class="test-table"
      >
        <!-- 自定义列示例 -->
        <template #custom-status="{ value }">
          <span :style="{ color: value === 'active' ? 'green' : 'red' }">
            {{ value }}
          </span>
        </template>
      </FreezeTable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.test-table {
  max-height: 65vh;
  margin-top: 2rem;
}
</style>