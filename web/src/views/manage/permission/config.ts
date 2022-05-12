import { Buttons, MyTable } from '@/types/components';
import Target from './index.vue';
import MyTableComponent from '@/components/table/table.vue';
import { UserListType } from '@/api/manage/user';
import asideTree from '@/views/manage/role/aside-tree.vue';
import { RoleList } from '@/api/manage/role';
import Permission, { MenuTree } from '@/api/manage/permission';
import Vue, { CreateElement, VNode } from 'vue';

export default class {
    private formData: Record<string, any> = {};
    private dialogSelection: UserListType[] = [];
    private roleId = '';
    private roleName = '';
    private permissionMap = new Map();
    private rolePermission: string[] = [];

    public constructor(private target: Target) {}

    public get tableOptions() {
        const option: MyTable = {
            page: {
                pageSize: 10,
                pageSizes: [10, 20, 30, 50]
            },
            aside: {
                component: asideTree,
                events: {
                    'node-click': async (data: RoleList) => {
                        this.roleId = data.id;
                        this.roleName = data.name;
                        await this.myTable.search();
                        await this.getRolePermission();
                    }
                },
                bind: {
                    operation: false
                }
            },
            buttons: this.buttons,
            title: '权限管理',
            header: [
                {
                    label: '首页',
                    path: '/'
                },
                {
                    label: '权限管理'
                }
            ],
            store: Permission.getPermissionList,
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
                    width: '200',
                    label: '模块',
                    dataIndex: 'lv1',
                    component: {
                        component: (value: undefined, data: MenuTree) => {
                            const target = this.target;
                            return Vue.extend({
                                render(createElement: CreateElement): VNode {
                                    // eslint-disable-next-line @typescript-eslint/no-this-alias
                                    const self = this;
                                    return createElement(
                                        'el-checkbox',
                                        {
                                            props: {
                                                value: self.value,
                                                disabled: self.disabled
                                            },
                                            on: {
                                                change: (val: boolean) => {
                                                    target.$emit(`change-value-${data.menuId}`, val);
                                                },
                                                input(val: boolean) {
                                                    self.value = val;
                                                }
                                            }
                                        },
                                        data.name
                                    );
                                },
                                data(): {
                                    value: boolean;
                                    disabled: boolean;
                                } {
                                    return {
                                        value: false,
                                        disabled: true
                                    };
                                },
                                mounted() {
                                    target.$on(`change-parent-value-${data.menuId}`, (val: boolean) => {
                                        this.value = val;
                                    });
                                    target.$on('change-disabled', (val: boolean) => {
                                        this.disabled = val;
                                    });
                                }
                            });
                        }
                    }
                },
                {
                    label: '权限',
                    dataIndex: 'lv2',
                    component: {
                        component: (value: undefined, data: MenuTree) => {
                            const target = this.target;
                            const { permissionMap } = this;
                            return Vue.extend({
                                render(createElement: CreateElement): VNode {
                                    // eslint-disable-next-line @typescript-eslint/no-this-alias
                                    const self = this;
                                    const elCheckbox = data.children?.map((v) =>
                                        createElement(
                                            'el-checkbox',
                                            {
                                                props: {
                                                    label: v.id
                                                },
                                                key: v.id,
                                                on: {}
                                            },
                                            v.name
                                        )
                                    );
                                    return createElement(
                                        'el-checkbox-group',
                                        {
                                            ref: 'checkbox-group',
                                            props: {
                                                value: self.value,
                                                disabled: self.disabled
                                            },
                                            on: {
                                                input(val: string[]) {
                                                    self.value = val;
                                                }
                                            }
                                        },
                                        elCheckbox
                                    );
                                },
                                watch: {
                                    value(val: string[]) {
                                        target.$emit(
                                            `change-parent-value-${data.menuId}`,
                                            this.value.length === data.children?.length
                                        );

                                        permissionMap.set(data.menuId, val);
                                    }
                                },
                                data(): {
                                    value: string[];
                                    disabled: boolean;
                                } {
                                    return {
                                        value: [],
                                        disabled: true
                                    };
                                },
                                mounted() {
                                    const ids = data.children?.map((v) => v.id);
                                    target.$on(`change-value-${data.menuId}`, (val: boolean) => {
                                        if (val) {
                                            this.value = ids ?? [];
                                        } else {
                                            this.value = [];
                                        }
                                    });
                                    target.$on('change-disabled', (val: boolean) => {
                                        this.disabled = val;
                                    });
                                    target.$on('change-default-checked', (val: string[]) => {
                                        this.value = val.filter((v) => ids?.includes(v));
                                    });
                                }
                            });
                        }
                    }
                }
            ]
        };

        return option;
    }

    private get myTable() {
        return this.target.$refs.myTable as MyTableComponent;
    }

    private get buttons() {
        const buttons: Buttons[] = [
            {
                dataIndex: 'editPermission',
                type: 'primary',
                label: '编辑权限',
                click: () => {
                    this.target.$emit('change-disabled', false);
                    this.myTable.updateOptions({
                        'buttons[0].label': '保存',
                        'buttons[0].click': async () => {
                            const values: string[] = [];
                            this.permissionMap.forEach((v) => {
                                values.push(v);
                            });
                            const permissionId = values.flat();
                            const roleId = this.roleId;
                            await Permission.changeRolePermission({
                                permissionId,
                                roleId
                            });

                            await this.target.$alert('提交成功', '提示', {
                                type: 'success'
                            });
                            await this.getRolePermission();
                            this.target.$emit('change-disabled', true);

                            this.myTable &&
                                this.myTable.updateOptions({
                                    buttons
                                });
                        },
                        'buttons[1]': {
                            dataIndex: 'cancel',
                            label: '取消',
                            click: () => {
                                this.target.$emit('change-disabled', true);
                                this.refreshChecked();
                                this.myTable.updateOptions({
                                    buttons
                                });
                            }
                        }
                    });
                }
            }
        ];

        return buttons;
    }

    private async getRolePermission() {
        this.rolePermission = (
            await Permission.getRolePermissionList({
                roleId: this.roleId
            })
        ).data;
        this.refreshChecked();
    }

    private refreshChecked() {
        this.target.$emit('change-default-checked', this.rolePermission);
    }
}
