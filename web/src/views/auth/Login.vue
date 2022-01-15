<template>
    <div class="login">
        <div class="form">
            <el-menu
                default-active="1"
                mode="horizontal"
                background-color="#fff"
                text-color="#000"
                active-text-color="#08c"
            >
                <el-menu-item index="1">登录</el-menu-item>
            </el-menu>
            <el-form
                :model="formData"
                :rules="rules"
                ref="formData"
                status-icon
                label-width="80px"
                class="demo-ruleForm"
            >
                <el-form-item label="用户名" prop="userName">
                    <el-input
                        v-model="formData.userName"
                        @keydown.enter.native="login('formData')"
                        placeholder="请输入用户名"
                    />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input
                        v-model="formData.password"
                        @keyup.enter.native="login('formData')"
                        type="password"
                        placeholder="请输入密码"
                    />
                </el-form-item>
                <el-form-item label="验证码">
                    <div id="g-recaptcha">Submit</div>
                </el-form-item>
                <el-button type="primary" round @click="login('formData')" class="login-btn">登录</el-button>
            </el-form>
        </div>
    </div>
</template>
<style lang="less" scoped>
.login {
    width: 100%;
    height: 100%;
    background: url(../../assets/logo.jpg) no-repeat center;
    background-size: contain;
    .form {
        width: 420px;
        height: 380px;
        position: absolute;
        z-index: 12;
        left: 50%;
        top: 50%;
        margin-left: -200px;
        margin-top: -150px;
        background: rgba(255, 255, 255, 0.5);

        .el-menu {
            .el-menu-item {
                width: 100%;
                text-align: center;
            }
        }
        .demo-ruleForm {
            padding: 10px 20px;
            margin-top: 30px;
            text-align: center;
        }
        .login-btn {
            width: 70%;
        }
    }
}
</style>
<script lang="ts">
// vue-property-decorator
import { Vue, Component } from 'vue-property-decorator';
import { Check, MutationsFunction } from '@/types/store';
import { Secret } from '@/utils/enum';
import { Md5 } from 'ts-md5';
import auth from '@/api/auth';
import { namespace } from 'vuex-class';
import utils from '@/utils';
import { addRoutes } from '@/middleware/getRoutes';

interface LoginRes {
    username: string;
    nickname: string;
    avatar: string;
    create_date: string;
    token: string;
}

interface Salt {
    salt: string;
}

const checkUserName: Check = (rule, value, callback) => {
    if (!value) return callback(new Error('用户名不能为空'));
    if (!/^[a-zA-Z]{4,20}$/g.test(value)) return callback(new Error('用户名为4-20位大小写字母'));
    return callback();
};

const checkPassword: Check = (rule, value, callback) => {
    if (!value) return callback(new Error('密码不能为空'));
    if (!/^[A-Za-z\d_@$!%*?&.]{6,16}$/.test(value)) {
        return callback(new Error('密码为6-16位大小写字母，数字，特殊符号'));
    }

    return callback();
};

interface Form {
    userName: string;
    password: string;
}

const user = namespace('user');
@Component
export default class extends Vue {
    public scriptSitekey = '6LcIylwdAAAAAABZ-eMKEwb0fffyHbqXBbkzyK5L';

    public rules = {
        userName: [{ validator: checkUserName, trigger: 'blur' }],
        password: [{ validator: checkPassword, trigger: 'blur' }]
    };

    @user.Mutation('CHANGE_USER_INFO')
    private changeUserInfo!: MutationsFunction;

    private formData: Form = {
        userName: '',
        password: ''
    };

    private isVerify = false;

    private scriptSrc = 'https://www.recaptcha.net/recaptcha/api.js';

    public async created() {
        try {
            (window as any).onloadCallback = this.grecaptchaOnloadCallback;
            await utils.loadScript(this.scriptSrc + '?onload=onloadCallback');
        } catch (error) {
            console.log(error);
        }
    }

    private grecaptchaOnloadCallback() {
        (window as any).grecaptcha.render('g-recaptcha', {
            sitekey: this.scriptSitekey, //公钥
            callback: this.onSubmit, //验证成功回调
            'expired-callback': this.recaptchaExpired, //验证过期回调
            'error-callback': this.errorCallback //验证错误回调
        });
    }

    public async login(formName: string) {
        if (!this.isVerify) {
            this.$alert('请先点击验证码进行进行验证', {
                title: '提示',
                type: 'error'
            });
            return;
        }
        (this.$refs[formName] as HTMLFormElement).validate(async (valid: boolean) => {
            if (!valid) return false;
            try {
                const {
                    data: { salt }
                } = await auth.getSalt<Salt>();

                const md5Password = Md5.hashStr(
                    Md5.hashStr(Md5.hashStr(this.formData.password) + Secret.PASSWORD_SECRET) + salt
                );
                const res = await auth.login<LoginRes>({
                    username: this.formData.userName,
                    password: md5Password
                });
                const { data } = res;
                const obj = {
                    nickname: data.nickname,
                    avatar: data.avatar,
                    createDate: data.create_date,
                    username: data.username
                };

                this.changeUserInfo(obj);
                sessionStorage.setItem('token', data.token);

                this.$alert('登陆成功，点击跳转首页', {
                    title: '提示',
                    type: 'success'
                }).then(async () => {
                    await addRoutes();
                    this.$router.replace('/');
                });
            } catch (error) {
                // this.isVerify = false;
            }
        });
    }

    private async onSubmit(token: string) {
        try {
            await auth.googleVerify({
                token
            });

            this.isVerify = true;
        } catch (error) {
            this.isVerify = false;
            console.log(error);
        }
    }

    private recaptchaExpired() {
        this.isVerify = false;
    }

    private errorCallback() {
        this.$alert('验证失败，请重试', {
            title: '提示',
            type: 'error'
        });
        this.isVerify = false;
    }
}
</script>
