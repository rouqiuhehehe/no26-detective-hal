<template>
    <el-container>
        <el-header v-if="!isEmptyObject(option.header)" height="30px">
            <el-breadcrumb class="my-breadcrumb" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item
                    v-for="item in option.header"
                    :key="item.label"
                    :to="item.path ? { path: item.path } : false"
                    >{{ item.label }}</el-breadcrumb-item
                >
            </el-breadcrumb>
        </el-header>
        <el-main
            :class="{
                'has-pagination-main': !isEmptyObject(this.option.page)
            }"
        >
            <el-descriptions :title="option.title" :column="1"></el-descriptions>
            <div class="my-table">
                <div class="search-form">
                    <MyForm ref="searchForm" v-if="!isEmptyObject(option.search)" :option="option.search"></MyForm>
                    <div style="text-align: right">
                        <template v-if="!isEmptyObject(option.buttons)">
                            <template v-for="item in option.buttons">
                                <template v-if="runFnComponent(item.show) !== false">
                                    <component
                                        v-if="item.component"
                                        :key="item.dataIndex"
                                        :is="runFnComponent(item.component.component, null, {}, item, option)"
                                        v-bind="runFnComponent(item.component.bind, null, {}, item, option)"
                                        v-on="runFnComponent(item.component.events, null, {}, item, option)"
                                    >
                                    </component>
                                    <el-button
                                        :key="item.dataIndex"
                                        v-else
                                        :type="item.type || 'primary'"
                                        :icon="item.icon || ''"
                                        @click="dialogFormClick(item.click, item, options)"
                                        v-html="runFnComponent(item.label, item, option)"
                                    ></el-button>
                                </template>
                            </template>
                        </template>
                        <el-button v-if="!isEmptyObject(option.search)" type="primary" @click="search">查询</el-button>
                    </div>
                </div>
                <el-table :data="tableData" v-bind="getTableBind">
                    <el-table-column
                        v-for="item in options.columns"
                        v-bind="getTableItemBind(item)"
                        :key="item.dataIndex"
                    >
                        <template slot-scope="scope">
                            <component
                                v-if="!isEmptyObject(item.component)"
                                :is="
                                    runFnComponent(
                                        item.component.component,
                                        scope.row[item.dataIndex],
                                        scope.row,
                                        item,
                                        options
                                    )
                                "
                                v-bind="
                                    runFnComponent(
                                        item.component.bind,
                                        scope.row[item.dataIndex],
                                        scope.row,
                                        item,
                                        options
                                    )
                                "
                                v-on="
                                    runFnComponent(
                                        item.component.events,
                                        scope.row[item.dataIndex],
                                        scope.row,
                                        item,
                                        options
                                    )
                                "
                            >
                                {{
                                    runFnComponent(
                                        item.component.label,
                                        scope.row[item.dataIndex],
                                        scope.row,
                                        item,
                                        options
                                    )
                                }}
                            </component>
                            <div
                                v-else-if="typeof item.beforeRender === 'function'"
                                v-html="
                                    item.beforeRender.call(thisArg, scope.row[item.dataIndex], scope.row, item, options)
                                "
                            ></div>
                            <div v-else>{{ scope.row[item.dataIndex] }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-if="!isEmptyObject(options.operation)"
                        v-bind="getTableItemBind(options.operation)"
                        label="操作"
                    >
                        <template slot-scope="scope">
                            <el-row :span="10">
                                <template v-for="item in options.operation.button">
                                    <template v-if="runFnComponent(item.show) !== false">
                                        <component
                                            v-if="!isEmptyObject(item.component)"
                                            :key="item.dataIndex"
                                            :is="
                                                runFnComponent(item.component.component, null, scope.row, item, options)
                                            "
                                            v-bind="runFnComponent(item.component.bind, null, scope.row, item, options)"
                                            v-on="runFnComponent(item.component.events, null, scope.row, item, options)"
                                        ></component>
                                        <el-button
                                            type="text"
                                            v-else
                                            :key="item.dataIndex"
                                            @click="dialogFormClick(item.click, scope.row, item, options)"
                                            v-html="
                                                runFnComponent(item.beforeRender, null, scope.row, item, options) ||
                                                item.label ||
                                                getEditLabel(item.form.type)
                                            "
                                        ></el-button>
                                    </template>
                                </template>
                            </el-row>
                            <!--                    <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>-->
                            <!--                    <el-button type="text" size="small">编辑</el-button>-->
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <el-pagination
                v-if="!isEmptyObject(this.options.page)"
                class="my-table-pagination"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                v-bind="getPaginationBind"
                :total="total"
            >
            </el-pagination>
            <template v-for="item in options.buttons">
                <MyDialogForm
                    v-if="!isEmptyObject(item.dialog) && runFnComponent(item.show) !== false"
                    :key="item.dataIndex"
                    :ref="item.dataIndex + 'Form'"
                    :option="item.dialog"
                ></MyDialogForm>
            </template>
            <template v-for="item in options.operation.button">
                <MyDialogForm
                    v-if="!isEmptyObject(item.form) && runFnComponent(item.show) !== false"
                    :key="item.dataIndex"
                    :ref="item.dataIndex + 'Form'"
                    :option="item"
                ></MyDialogForm>
            </template>
        </el-main>
    </el-container>
</template>

<script lang="ts">
import { Component, Inject, Prop, ProvideReactive, Vue, Watch } from 'vue-property-decorator';
import { FormType, MyTable, MyTableColumns } from '@/types/components';
import form from '@/components/form/form.vue';
import utils from '@/utils';
import Config from './config';
import dialogForm from '@/components/dialogForm/dialogForm.vue';
import { AxiosResponse } from 'axios';

@Component({
    name: 'MyTable',
    components: {
        MyForm: form,
        MyDialogForm: dialogForm
    }
})
export default class extends Vue {
    @Prop({
        type: Object,
        required: true
    })
    public option!: MyTable;

    public options!: MyTable;

    public tableData: Record<string, any>[] = [];

    public currentPage = 1;

    public total = 0;

    @Inject({
        from: 'thisArg',
        default: null
    })
    private readonly controller?: Vue;

    @ProvideReactive('myTable')
    public MyTable = this;

    @ProvideReactive('tableColumnData')
    public tableColumnData = {};

    public thisArg!: Vue;

    public config;

    private init = false;

    private limit = 10;

    @Watch('option', { immediate: true, deep: true })
    public async onOptionChange() {
        this.thisArg = this.controller ?? this;
        this.options = utils.deepClone(this.option);

        if (!this.init) {
            this.init = true;

            if (!this.options.store) {
                throw new Error('this options must has a store');
            } else {
                if (Array.isArray(this.options.store)) {
                    this.tableData = this.options.store;
                } else if (typeof this.options.store === 'function') {
                    if (!this.isEmptyObject(this.options.search)) {
                        this.$nextTick(async () => {
                            await this.search();
                        });
                    } else {
                        await this.search();
                    }
                }
            }
        }
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

    public get getPaginationBind() {
        const obj = utils.deepClone(this.config.defaultPaginationBind);
        for (const i in this.options.page) {
            if (this.config.paginationBind.includes(i)) {
                obj[i] = this.options.page[i];
            }
        }

        this.limit = obj.pageSize;
        return obj;
    }

    public getTableItemBind(item: MyTableColumns) {
        const obj = utils.deepClone(this.config.defaultTableItemBind);
        for (const i in item) {
            if (this.config.tableItemBind.includes(i)) {
                obj[i] = item[i];
            }
        }
        return obj;
    }

    public runFnComponent(fn: any, ...arg: any[]) {
        return utils.runFnComponent(this.thisArg)(fn, ...arg);
    }

    public getEditLabel(formType: FormType) {
        switch (formType) {
            case 'edit':
                return '编辑';
            case 'del':
                return '删除';
            case 'view':
                return '查看';
            default:
                throw new TypeError('请配置edit名称');
        }
    }

    public dialogFormClick(fn?: any, ...arg: any[]) {
        if (fn) {
            const res = fn.call(this.thisArg, ...arg);

            if (res === false) {
                return;
            }
        }

        let tableData, item;
        if (arg.length === 3) {
            [tableData, item] = arg;
        } else if (arg.length === 2) {
            item = arg[0];
            tableData = null;
        }
        this.tableColumnData = tableData;

        if (!this.isEmptyObject(item.dialog) || !this.isEmptyObject(item.form)) {
            (this.$refs[item.dataIndex + 'Form']![0] as any).show();
        }
    }

    public async search() {
        const searchForm = this.$refs.searchForm as Vue & { formData: Record<string, any> };

        const data = searchForm?.formData;
        await this.searchHandle(data);
    }

    public handleSizeChange(limit: number) {
        this.currentPage = 1;
        this.limit = limit;
        this.search();
    }

    public handleCurrentChange() {
        this.search();
    }

    public isEmptyObject(obj: unknown) {
        return utils.isEmpty(obj);
    }

    private async searchHandle(data: Record<string, any>) {
        let params: boolean | Record<string, any> = {
            ...utils.deepClone(data),
            limit: this.limit,
            page: this.currentPage
        };

        if (typeof this.options.beforeSearch === 'function') {
            params = this.options.beforeSearch!.call(this.thisArg, params as Record<string, any>, this.options, this);
        }

        if (params !== false) {
            let res = await (this.options.store as (params: any) => Promise<AxiosResponse<any, any>>)(params);
            let data = res.data;

            if (typeof this.options.afterSearch === 'function') {
                data = this.options.afterSearch.call(this.thisArg, data, this.options, this);
            }

            this.tableData = data;
            if (res.pagination) {
                this.total = res.pagination.total;
            }
        }
    }
}
</script>

<style lang="less" scoped>
.my-breadcrumb {
    line-height: 30px;
}

.search-form {
    padding: 20px 0;
}

.has-pagination-main {
    position: relative;
    padding-bottom: 90px;
}

.my-table-pagination {
    position: absolute;
    bottom: 20px;
    right: 15px;
}
</style>
