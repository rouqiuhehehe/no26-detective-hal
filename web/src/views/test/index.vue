<template>
    <my-table ref="myTable" :option="config.tableOptions"></my-table>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MyTable from '@/components/table/table.vue';
import Config from './config';

@Component({
    name: 'test',
    components: {
        'my-table': MyTable
    }
})
export default class extends Vue {
    public config!: Config;
    public show = false;

    public constructor() {
        super();
    }

    public created() {
        this.config = new Config(this);
    }
}
</script>

<style lang="less" scoped>
/deep/ .el-input-number--mini {
    width: 38px;

    .el-input__inner {
        padding: 0 10px;
    }
}
</style>
