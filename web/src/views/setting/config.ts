import Setting from '@/api/setting';
import autoBind from '@/descriptors/Autobind';
import store from '@/store';
import { MyDialog } from '@/types/components';
import Vue from 'vue';
export default class {
    private imgUrl = '';

    public constructor(private afterCommit: () => void) {}

    public get dialogOptions() {
        const { afterCommit } = this;
        const option: MyDialog = {
            form: {
                type: 'edit',
                store: Setting.updateUserInfo,
                viewStore: Setting.viewSettingUserInfo,
                async afterCommit(this: Vue) {
                    await this.$alert('提交成功', '提示', {
                        type: 'success'
                    });

                    await store.dispatch('user/getUserInfo');
                    await afterCommit();
                },
                columns: [
                    {
                        xType: 'input',
                        dataIndex: 'nickname',
                        label: '昵称：',
                        // box: 6,
                        placeholder: '请输入昵称',
                        required: true
                    },
                    {
                        xType: 'input',
                        dataIndex: 'username',
                        label: '用户名：',
                        // box: 10,
                        disabled: true
                    },
                    {
                        xType: 'imgUpload',
                        dataIndex: 'avatar',
                        label: '头像：',
                        beforeRender: this.avatarBeforeRender
                        // box: 6
                    }
                ]
            }
        };
        return option;
    }

    @autoBind
    private avatarBeforeRender(v: string) {
        this.imgUrl = v;
        return v;
    }
}
