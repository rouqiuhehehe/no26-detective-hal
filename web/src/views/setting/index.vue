<template>
    <el-container>
        <el-header height="30px">
            <el-breadcrumb class="my-breadcrumb" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>账号设置</el-breadcrumb-item>
            </el-breadcrumb>
        </el-header>
        <el-main>
            <el-descriptions title="用户信息" :column="1">
                <template slot="extra">
                    <el-button type="primary" @click="dialogShow">编辑</el-button>
                </template>
                <el-descriptions-item v-for="item in descriptionsData" :key="item.key" :label="item.label">
                    <el-image
                        v-if="item.key === 'avatar'"
                        style="width: 35px; height: 35px"
                        :src="item.value"
                        :preview-src-list="[item.value]"
                    >
                    </el-image>
                    <span v-else class="descriptions-value">
                        {{ item.value }}
                    </span>
                </el-descriptions-item>
                <el-descriptions-item label="操作">
                    <el-button type="primary" size="small" @click="updateOperaList">操作</el-button>
                </el-descriptions-item>
            </el-descriptions>
        </el-main>
        <dialogForm ref="my-dialog" :option="config.dialogOptions"></dialogForm>
    </el-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Setting from '@/api/setting';
import utils from '@/utils';
import dialogForm from '@/components/dialogForm/dialogForm.vue';
import Config from './config';

interface DescriptionsData {
    label: string;
    key: string;
    value: string;
}

@Component({
    components: {
        dialogForm
    }
})
export default class extends Vue {
    public loading = true;
    public descriptionsData: DescriptionsData[] = [];
    public config = new Config(this.getUserInfo);

    public async mounted() {
        await this.getUserInfo();
    }

    public dialogShow() {
        (this.$refs['my-dialog'] as any).show();
    }

    public async updateOperaList() {
        const h = this.$createElement;
        try {
            await this.$msgbox({
                title: '提示',
                message: h('p', [
                    h('span', '请问确定要更新剧本类型吗？'),
                    h(
                        'span',
                        {
                            style: {
                                color: '#f00'
                            }
                        },
                        '(该操作涉及删库，请谨慎操作) '
                    ),
                    h('span', '是否继续？')
                ]),
                showCancelButton: true,
                type: 'warning'
            });
            await Setting.updateOperaList();
            await this.$alert('操作成功！', '提示', {
                type: 'success'
            });
        } catch (e) {
            //
        }
    }

    private async getUserInfo() {
        const { data } = await Setting.getSettingUserInfo();
        this.descriptionsData = [];

        let item: DescriptionsData;
        Object.keys(data).forEach((key) => {
            const value: string = data[key];
            switch (key) {
                case 'nickname':
                    item = {
                        label: '昵称',
                        key,
                        value
                    };
                    break;
                case 'avatar':
                    item = {
                        label: '头像',
                        key,
                        value
                    };
                    break;
                case 'create_date':
                    item = {
                        label: '创建时间',
                        key,
                        value: utils.date(value, 'yyyy-MM-dd HH:mm:ss')
                    };
                    break;
                case 'username':
                    item = {
                        label: '用户名',
                        key,
                        value
                    };
                    break;
                case 'update_date':
                    item = {
                        label: '修改时间',
                        key,
                        value: utils.date(value, 'yyyy-MM-dd HH:mm:ss')
                    };
                    break;
                case 'permission':
                    item = {
                        label: '权限',
                        key,
                        value
                    };
                    break;
                case 'uid':
                    item = {
                        label: '用户id',
                        key,
                        value
                    };
            }
            this.descriptionsData.push(item);
        });
    }
}
</script>

<style lang="less" scoped>
.my-breadcrumb {
    line-height: 30px;
}

.descriptions-value {
    color: #333;
}

/deep/ .el-descriptions-item__container {
    align-items: center;
}

.bg-purple {
    background: #d3dce6;
}
.bg-purple-light {
    background: #e5e9f2;
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}
</style>
