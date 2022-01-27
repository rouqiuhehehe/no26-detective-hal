<template>
    <div class="my-table">
        <MyForm v-if="option.search" :option="option.search"></MyForm>
        <el-table :data="tableData" v-bind="getTableBind">
            <el-table-column v-for="item in options.columns" :key="item.dataIndex">
                <template slot-scope="scope">
                    <component
                        v-if="!isEmptyObject(item.component)"
                        :is="
                            typeof item.component.component === 'function'
                                ? item.component.component.call(thisArg, scope.row, scope, item, options)
                                : item.component.component
                        "
                        v-bind="
                            typeof item.component.bind === 'function'
                                ? item.component.bind.call(thisArg, scope.row, scope, item, options)
                                : item.component.bind
                        "
                        v-on="
                            typeof item.component.events === 'function'
                                ? item.component.events.call(thisArg, scope.row, scope, item, options)
                                : item.component.events
                        "
                    ></component>
                    <div
                        v-else-if="typeof item.beforeRender === 'function'"
                        v-html="item.beforeRender.call(thisArg, scope.row, scope, item, options)"
                    ></div>
                    <div v-else>{{ scope.row }}</div>
                </template>
            </el-table-column>
            <el-table-column v-if="!isEmptyObject(options.operation)" label="操作">
                <template slot-scope="scope">
<!--                    <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>-->
<!--                    <el-button type="text" size="small">编辑</el-button>-->
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts">
import { Component, InjectReactive, Prop, Vue, Watch } from 'vue-property-decorator';
import { MyTable } from '@/types/components';
import form from '@/components/form/form.vue';
import utils from '@/utils';
import Config from './config';

@Component({
    name: 'table',
    components: {
        MyForm: form
    }
})
export default class extends Vue {
    @Prop({
        type: Object,
        required: true
    })
    private option!: MyTable;

    public options!: MyTable;

    public tableData!: Record<string, any>[];

    @InjectReactive({
        from: 'thisArg',
        default: null
    })
    private controller?: Vue;

    public thisArg!: Vue;

    public config;

    @Watch('option', { immediate: true, deep: true })
    public async onOptionChange() {
        this.thisArg = this.controller ?? this;
        this.options = utils.deepClone(this.option);
    }

    public constructor() {
        super();
        this.config = new Config();
    }

    public get getTableBind() {
        const obj = utils.deepClone(this.config.defaultTableBind);
        for (const i in this.options) {
            if (this.config.tableBind.includes(i)) {
                obj[i] = this.options[i];
            }
        }

        return obj;
    }

    public isEmptyObject(obj: Record<any, any>) {
        return utils.isEmpty(obj);
    }
}
</script>

<style lang="less" scoped></style>
