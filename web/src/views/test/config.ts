import { Buttons, Columns, MyForm, MyTable, OperationButton } from '@/types/components';
import Test from '@/api/test/index';
import Autobind from '@/descriptors/Autobind';
import Import from '@/components/Import.vue';
import Target from './index.vue';
import MyTableComponent from '@/components/table/table.vue';
import Dictionary from '@/api/dictionary';

export default class {
    private selection: Record<string, any>[] = [];
    private formData: Record<string, any> = {};

    public constructor(private target: Target) {}

    public get tableOptions() {
        const option: MyTable = {
            page: {
                pageSize: 10,
                pageSizes: [10, 20, 30, 50]
            },
            search: this.searchOptions,
            buttons: this.buttons,
            title: 'test',
            header: [
                {
                    label: '首页',
                    path: '/'
                },
                {
                    label: 'test'
                }
            ],
            events: {
                'selection-change': this.tableSelection
            },
            store: Test.getList,
            beforeSearch: (v: Record<string, any>) => {
                this.formData = v;
                return v;
            },
            columns: [
                {
                    label: '',
                    dataIndex: 'selection',
                    type: 'selection'
                },
                {
                    label: 'id',
                    dataIndex: 'id'
                },
                {
                    label: '名称',
                    dataIndex: 'name'
                },
                {
                    label: '年龄',
                    dataIndex: 'age'
                },
                {
                    label: '类型',
                    dataIndex: 'typeValue'
                },
                {
                    label: '创建时间',
                    dataIndex: 'createTime',
                    sortable: 'custom'
                },
                {
                    label: '修改时间',
                    dataIndex: 'updateTime'
                }
            ],
            operation: {
                fixed: 'right',
                button: this.operation
            }
        };

        return option;
    }

    private get myTable() {
        return this.target.$refs.myTable as MyTableComponent;
    }

    private get buttons() {
        const buttons: Buttons[] = [
            {
                dataIndex: 'add',
                label: '新增',
                type: 'primary',
                dialog: {
                    title: '新增',
                    form: {
                        type: 'add',
                        store: Test.add,
                        columns: [
                            {
                                xType: 'input',
                                dataIndex: 'name',
                                label: '姓名',
                                placeholder: '请输入姓名',
                                required(v) {
                                    if (!v) {
                                        return '姓名不能为空';
                                    }
                                    if (
                                        !/^(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]){2,8}$/.test(
                                            v
                                        )
                                    ) {
                                        return '请输入2~8位以内的汉字';
                                    }
                                    return true;
                                },
                                box: 6,
                                showStar: true
                            },
                            {
                                xType: 'input',
                                dataIndex: 'age',
                                label: '年龄',
                                type: 'number',
                                placeholder: '请输入年龄',
                                required(v) {
                                    if (!v) {
                                        return '年龄不能为空';
                                    }

                                    if (!/^\d{1,3}$/.test(v)) {
                                        return '请输入正确的年龄';
                                    }

                                    return true;
                                },
                                box: 6,
                                showStar: true
                            },
                            {
                                label: '类型',
                                placeholder: '请选择剧本类型',
                                dataIndex: 'type',
                                xType: 'select',
                                store: Dictionary.getOperaTypes,
                                formatKey: {
                                    key: 'id',
                                    value: 'label'
                                },
                                collapseTags: true,
                                multiple: true,
                                box: 6
                            }
                        ]
                    }
                }
            },
            {
                dataIndex: 'bulkUpdate',
                label: '批量修改',
                type: 'primary',
                disabled: true,
                dialog: {
                    title: '批量修改',
                    form: {
                        type: 'add',
                        store: Test.bulkEdit,
                        columns: [
                            {
                                label: '类型',
                                placeholder: '请选择剧本类型',
                                dataIndex: 'type',
                                xType: 'select',
                                store: Dictionary.getOperaTypes,
                                formatKey: {
                                    key: 'id',
                                    value: 'label'
                                },
                                collapseTags: true,
                                multiple: true,
                                box: 6
                            }
                        ],
                        beforeCommit: (data) => {
                            return this.selection.map((v) => ({
                                ...data,
                                id: v.id
                            }));
                        }
                    }
                }
            },
            {
                dataIndex: 'bulk-del',
                label: '批量移除',
                type: 'primary',
                disabled: true,
                dialog: {
                    form: {
                        type: 'del',
                        store: Test.bulkDel,
                        primaryKey: 'id',
                        message: () => {
                            return `确定删除已选择的${this.selection.length}条数据吗？`;
                        },
                        beforeCommit: () => {
                            return {
                                id: this.selection.map((v) => v.id)
                            };
                        }
                    }
                }
            },
            {
                dataIndex: 'import',
                label: '导入',
                component: {
                    component: Import,
                    bind: {
                        option: {
                            accept: '.xls,.xlsx',
                            template: {
                                title: 'test模板',
                                store: Test.downloadImportTemplate
                            },
                            store: Test.import
                        },
                        show: this.target.show
                    },
                    events: {
                        'update:show': () => {
                            this.target.show = false;
                        },
                        'after-commit': async () => {
                            await this.myTable.search();
                        }
                    }
                },
                click: () => {
                    this.target.show = true;
                }
            },
            {
                dataIndex: 'export',
                label: '导出',
                click: this.export
            }
        ];

        return buttons;
    }

    private get searchOptions() {
        const option: Omit<MyForm, 'type'> = {
            columns: [
                {
                    label: '姓名',
                    placeholder: '请输入姓名',
                    dataIndex: 'name',
                    xType: 'input',
                    box: 4
                },
                {
                    label: '年龄',
                    dataIndex: 'age',
                    placeholder: '请输入年龄',
                    xType: 'input',
                    box: 4
                },
                {
                    label: '类型',
                    placeholder: '请选择剧本类型',
                    dataIndex: 'type',
                    xType: 'select',
                    store: Dictionary.getOperaTypes,
                    formatKey: {
                        key: 'id',
                        value: 'label'
                    },
                    collapseTags: true,
                    multiple: true,
                    box: 4
                }
            ]
        };

        return option;
    }

    private get operation() {
        const buttons: OperationButton[] = [
            {
                dataIndex: 'view',
                form: {
                    type: 'view',
                    viewStore: Test.getView,
                    columns: this.getFormColumns,
                    primaryKey: 'id'
                }
            },
            {
                dataIndex: 'edit',
                form: {
                    type: 'edit',
                    store: Test.edit,
                    viewStore: Test.getView,
                    columns: this.getFormColumns,
                    primaryKey: 'id'
                }
            },
            {
                dataIndex: 'del',
                form: {
                    type: 'del',
                    store: Test.del,
                    primaryKey: 'id',
                    message(row) {
                        return `确定删除（姓名：${row!.name}）吗？`;
                    }
                }
            }
        ];

        return buttons;
    }

    private get getFormColumns() {
        const option: Columns[] = [
            {
                dataIndex: 'name',
                xType: 'input',
                label: '姓名',
                box: 6
            },
            {
                dataIndex: 'age',
                xType: 'input',
                label: '年龄',
                box: 6
            },
            {
                label: '类型',
                placeholder: '请选择剧本类型',
                dataIndex: 'type',
                xType: 'select',
                store: Dictionary.getOperaTypes,
                formatKey: {
                    key: 'id',
                    value: 'label'
                },
                collapseTags: true,
                multiple: true,
                box: 6
            }
        ];

        return option;
    }

    @Autobind
    private tableSelection(selection: Record<string, any>[]) {
        this.selection = selection;
        this.myTable.updateOptions({
            'buttons[1].disabled': !selection.length,
            'buttons[2].disabled': !selection.length
        });
    }

    @Autobind
    private async export() {
        const ids: string[] = [];
        if (this.selection && this.selection.length) {
            this.selection.forEach((v) => {
                ids.push(v.id);
            });
        }

        await Test.export({
            ...this.formData,
            ids
        });
    }
}
