import { Buttons, Columns, MyForm, MyTable, OperationButton } from '@/types/components';
import Test from '@/api/test/index';
import Autobind from '@/descriptors/Autobind';
import Target from './index.vue';
import MyTableComponent from '@/components/table/table.vue';
import User from '@/api/manage/user';

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
            title: '用户管理',
            header: [
                {
                    label: '首页',
                    path: '/'
                },
                {
                    label: 'user'
                }
            ],
            events: {
                'selection-change': this.tableSelection
            },
            store: User.getUserList,
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
                    label: 'uid',
                    dataIndex: 'uid'
                },
                {
                    label: '用户名',
                    dataIndex: 'username'
                },
                {
                    label: '昵称',
                    dataIndex: 'nickname'
                },
                {
                    label: '头像',
                    dataIndex: 'avatar',
                    component: {
                        component(v: string) {
                            if (v) {
                                return 'el-image';
                            }
                            return '';
                        },
                        bind(v: string) {
                            return {
                                src: v,
                                style: 'width: 50px;height: 50px;',
                                previewSrcList: [v]
                            };
                        }
                    }
                },
                {
                    label: '手机号',
                    dataIndex: 'phone'
                },
                {
                    label: '角色',
                    dataIndex: 'role'
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
        const buttons: Buttons[] = [];

        return buttons;
    }

    private get searchOptions() {
        const option: Omit<MyForm, 'type'> = {
            columns: [
                {
                    label: '用户名',
                    placeholder: '请输入姓名',
                    dataIndex: 'username',
                    xType: 'input',
                    box: 4
                },
                {
                    label: '昵称',
                    dataIndex: 'nickname',
                    placeholder: '请输入昵称',
                    xType: 'input',
                    box: 4
                },
                {
                    label: '手机号',
                    placeholder: '请输入手机号',
                    dataIndex: 'phone',
                    xType: 'input',
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
                    viewStore: User.getUserListView,
                    primaryKey: 'uid',
                    columns: this.getFormColumns
                }
            },
            {
                dataIndex: 'edit',
                form: {
                    type: 'edit',
                    store: Test.edit,
                    primaryKey: 'uid',
                    viewStore: Test.getView,
                    columns: this.getFormColumns
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
                dataIndex: 'username',
                xType: 'input',
                label: '用户名',
                box: 6
            },
            {
                dataIndex: 'nickname',
                xType: 'input',
                label: '昵称',
                box: 6
            },
            {
                dataIndex: 'phone',
                xType: 'input',
                label: '手机号',
                box: 6
            },
            {
                dataIndex: 'role',
                xType: 'text',
                label: '角色',
                box: 6
            },
            {
                xType: 'imgUpload',
                dataIndex: 'avatar',
                label: '头像：',
                // beforeRender: this.avatarBeforeRender
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
