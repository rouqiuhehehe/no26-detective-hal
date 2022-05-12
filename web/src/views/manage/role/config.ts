import { Buttons, Columns, MyForm, MyTable, OperationButton } from '@/types/components';
import Autobind from '@/descriptors/Autobind';
import Target from './index.vue';
import MyTableComponent from '@/components/table/table.vue';
import User, { UserListType } from '@/api/manage/user';
import asideTree from '@/views/manage/role/aside-tree.vue';
import Role, { RoleList } from '@/api/manage/role';

export default class {
    private formData: Record<string, any> = {};
    private dialogSelection: UserListType[] = [];
    private roleId = '';
    private roleName = '';

    public constructor(private target: Target) {}

    public get tableOptions() {
        const option: MyTable = {
            page: {
                pageSize: 10,
                pageSizes: [10, 20, 30, 50]
            },
            search: this.searchOptions,
            aside: {
                component: asideTree,
                events: {
                    'node-click': async (data: RoleList) => {
                        this.roleId = data.id;
                        this.roleName = data.name;
                        await this.myTable.search();
                    }
                }
            },
            buttons: this.buttons,
            title: '角色管理',
            header: [
                {
                    label: '首页',
                    path: '/'
                },
                {
                    label: '角色管理'
                }
            ],
            store: User.getUserList,
            beforeSearch: (v: Record<string, any>) => {
                if (!this.roleId) {
                    return false;
                }
                this.formData = v;
                return {
                    ...v,
                    role: this.roleId
                };
            },
            columns: [
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
        const buttons: Buttons[] = [
            {
                label: '新增',
                dataIndex: 'add',
                type: 'primary',
                dialog: {
                    component: {
                        component: MyTableComponent,
                        bind: this.dialogTableOption
                    },
                    commit: async () => {
                        if (!this.dialogSelection.length) {
                            return true;
                        }
                        const names = this.dialogSelection.map((v) => v.username);
                        try {
                            await this.target.$confirm(
                                `将在该角色(${this.roleName})下添加${
                                    this.dialogSelection.length
                                }名成员(${names.toString()})，是否继续？`,
                                '提示'
                            );
                            const userId = this.dialogSelection.map((v) => v.uid);
                            await Role.addUser({
                                roleId: this.roleId,
                                userId
                            });
                            await this.target.$alert('操作成功', '提示', {
                                type: 'success'
                            });

                            await this.myTable.search();
                        } catch (e) {
                            return false;
                        }
                    }
                }
            }
        ];

        return buttons;
    }

    private get dialogTableOption() {
        const option: MyTable = {
            store: User.getNotAddUserList,
            beforeSearch: (v) => ({
                ...v,
                id: this.roleId
            }),
            page: {
                pageSize: 10,
                pageSizes: [10, 20, 30, 50],
                absolute: false
            },
            search: this.searchOptions,
            columns: [
                {
                    label: '',
                    dataIndex: 'selection',
                    type: 'selection'
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
                    label: '手机号',
                    dataIndex: 'phone'
                }
            ],
            events: {
                'selection-change': this.dialogTableSelection
            }
        };

        return { option };
    }

    private get searchOptions() {
        const option: Omit<MyForm, 'type'> = {
            columns: [
                {
                    label: '用户名',
                    placeholder: '请输入姓名',
                    dataIndex: 'username',
                    xType: 'input',
                    box: 6
                },
                {
                    label: '昵称',
                    dataIndex: 'nickname',
                    placeholder: '请输入昵称',
                    xType: 'input',
                    box: 6
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
                dataIndex: 'del',
                label: '移除',
                form: {
                    primaryKey: 'uid',
                    type: 'del',
                    store: User.deleteRoleUser,
                    beforeCommit: (row) => ({
                        uid: row?.uid,
                        roleId: this.roleId
                    }),
                    message: (row) => {
                        return `确定移除该角色（${this.roleName}）下的用户（${row!.username}）吗？`;
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
                dataIndex: 'roleValue',
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
    private dialogTableSelection(selection: UserListType[]) {
        this.dialogSelection = selection;
    }
}
