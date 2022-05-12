<template>
    <div
        style="
            min-width: 220px;
            width: 220px;
            padding: 16px;
            height: calc(100% - 15px);
            border-right: 1px solid #eee;
            margin-right: 20px;
        "
    >
        <div style="display: flex; margin-bottom: 8px">
            <el-input
                v-model="searchVal"
                @keydown.native.enter="search"
                @clear="search"
                placeholder="搜索角色名"
                style="margin-right: 6px"
                clearable
            >
                <i slot="suffix" style="cursor: pointer" class="el-icon-search el-input__icon" @click="search"></i>
            </el-input>
            <el-button icon="el-icon-plus" size="small" @click="showDialog" v-if="operation"></el-button>
        </div>
        <el-scrollbar style="height: 100%">
            <el-tree
                ref="tree"
                :data="data"
                :props="defaultProps"
                node-key="id"
                :filter-node-method="filterNode"
                @node-click="$listeners['node-click']"
            >
                <div class="custom-tree-node" slot-scope="{ node, data }">
                    <el-tooltip :content="data.info" placement="bottom-start" effect="light">
                        <div style="width: 100%">
                            <span style="font-size: 14px">{{ node.label }}</span>
                            <el-dropdown @command="handleCommand($event, data)" v-if="operation">
                                <i class="el-icon-more-outline"></i>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                                    <el-dropdown-item command="del">删除</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                    </el-tooltip>
                </div>
            </el-tree>
        </el-scrollbar>
        <dialogForm v-if="operation" ref="dialogForm" :option="dialogFormOption"></dialogForm>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import dialogForm from '@/components/dialogForm/dialogForm.vue';
import { AddForm, EditForm, MyDialog } from '@/types/components';
import RegExp from '@/utils/RegExp';
import Role, { RoleList } from '@/api/manage/role';
import { Tree } from 'element-ui';

@Component({
    name: 'aside-tree',
    components: {
        dialogForm
    }
})
export default class extends Vue {
    @Prop({
        default: true
    })
    public operation!: boolean;

    public data: RoleList[] = [];

    public defaultProps = {
        children: 'children',
        label: 'name',
        value: 'id'
    };

    public searchVal = '';

    public get dialogFormOption(): MyDialog {
        let option: Omit<AddForm, 'columns'> | Omit<EditForm, 'columns'>;
        switch (this.dialogType) {
            case 'add':
                option = {
                    type: 'add',
                    store: Role.createRole
                };
                break;
            default:
                option = {
                    type: 'edit',
                    store: Role.updateRole,
                    primaryKey: 'id',
                    viewStore: Role.viewRole,
                    viewParams: () => ({
                        id: this.roleId
                    }),
                    beforeCommit: (v) => ({
                        ...v,
                        id: this.roleId
                    })
                };
                break;
        }
        return {
            width: '524px',
            title: option.type === 'add' ? '新增角色' : '编辑角色',
            form: {
                ...option,
                afterCommit: () => {
                    this.getTreeData();
                },
                columns: [
                    {
                        label: '角色名称',
                        placeholder: '请输入角色名称',
                        dataIndex: 'name',
                        xType: 'input',
                        showStar: true,
                        required: (value) => {
                            if (!value) {
                                return '请输入角色名称';
                            }
                            if (!RegExp.chineseAndNumberAndLetter(1, 20).test(value)) {
                                return '请输入1～20位以内的字符，支持汉字、数字、英文字母';
                            }
                            return true;
                        },
                        box: 24
                    },
                    {
                        label: '角色描述',
                        placeholder: '请输入角色描述',
                        dataIndex: 'info',
                        xType: 'input',
                        showStar: true,
                        required: true,
                        box: 24
                    }
                ]
            }
        };
    }

    public get dialogForm() {
        return this.$refs.dialogForm as dialogForm;
    }

    private dialogType = 'add';
    private roleId = '';

    public async mounted() {
        await this.getTreeData();
        this.$nextTick(() => {
            (this.$refs.tree as Tree).setCurrentKey(this.data[0].id);
            this.$emit('node-click', this.data[0]);
        });
    }

    public showDialog() {
        this.dialogForm.show();
    }

    public filterNode(value: string, data: RoleList) {
        return value ? data.name.includes(value) : true;
    }

    public search() {
        (this.$refs.tree! as Tree).filter(this.searchVal);
    }

    public async handleCommand(command: 'edit' | 'del', data: RoleList) {
        switch (command) {
            case 'edit':
                this.roleId = data.id;
                this.dialogType = 'edit';
                this.dialogForm.show();
                break;
            case 'del':
                try {
                    await this.$confirm(`确定删除角色：${data.name}吗？`, '删除', {
                        type: 'warning'
                    });
                    await Role.deleteRole({
                        id: data.id
                    });
                    await this.$alert('提交成功', '提示', {
                        type: 'success'
                    });
                    await this.getTreeData();
                } catch (e) {
                    //
                }
                break;
        }
    }

    private async getTreeData() {
        this.data = (await Role.getRoleList()).data;
    }
}
</script>

<style lang="less" scoped>
::v-deep .el-tree-node__content {
    height: 100%;
}
::v-deep .is-current {
    .el-tree-node__content {
        background: #f5f7fa;
    }
}
.custom-tree-node {
    width: 100%;
    > div {
        padding: 10px 20px 10px 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        i {
            transform: rotate(90deg);
            display: none;
        }

        &:hover {
            i {
                display: inline-block;
            }
        }
    }
}
</style>
