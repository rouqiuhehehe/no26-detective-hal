<template>
    <my-table :option="config.tableOptions" ref="myTable"></my-table>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MyTable from '@/components/table/table.vue';
import Config from './config';

@Component({
    name: 'user',
    components: {
        'my-table': MyTable
    }
})
export default class extends Vue {
    public constructor() {
        super();
    }

    public created() {
        this.config = new Config(this);
    }
    public config!: Config;
}
</script>

<style lang="less" scoped></style>
