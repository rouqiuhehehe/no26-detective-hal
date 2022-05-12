<template>
    <div>
        <my-table :option="config.tableOptions"></my-table>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MyTable from '@/components/table/table.vue';
import Config from './config';

const config = new Config();
@Component({
    name: 'operaList',
    components: {
        'my-table': MyTable
    }
})
export default class extends Vue {
    public config = config;
    // @Provide('thisArg')
    // public readonly thisArg = this;
}
</script>

<style lang="less" scoped>
/deep/.el-input-number--mini {
    width: 38px;
    .el-input__inner {
        padding: 0 10px;
    }
}
</style>
