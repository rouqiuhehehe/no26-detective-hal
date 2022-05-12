import Setting from '@/api/setting';
import autoBind from '@/descriptors/Autobind';
import store from '@/store';
import { MyDialog } from '@/types/components';
import Vue from 'vue';
import Util from '@/utils';

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
                primaryKey: 'id',
                beforeCommit(formData: Record<string, any>) {
                    return formData;
                },
                async afterCommit(this: Vue) {
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
                        required: {
                            trigger: 'change',
                            handle(v: string) {
                                if (!v) {
                                    return '请输入昵称';
                                } else if (Util.specialSymbolsRegExp().test(v)) {
                                    return '昵称不能输入特殊符号';
                                } else if (v.length < 4 || v.length > 8) {
                                    return '请输入4-8位昵称';
                                } else {
                                    return true;
                                }
                            }
                        }
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
