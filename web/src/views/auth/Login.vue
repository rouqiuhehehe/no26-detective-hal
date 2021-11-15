<template>
    <div class="login">
        <div class="form">
            <el-menu
                :default-active="activeIndex"
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
                <el-form-item label="userName" prop="userName">
                    <el-input
                        v-model="formData.userName"
                        @keydown.enter.native="login('formData')"
                        placeholder="please enter userName"
                    />
                </el-form-item>
                <el-form-item label="password" prop="password">
                    <el-input
                        v-model="formData.password"
                        @keyup.enter.native="login('formData')"
                        type="password"
                        placeholder="please enter password"
                    />
                </el-form-item>
                <el-button type="primary" round @click="login('formData')" class="login-btn">登录</el-button>
            </el-form>
        </div>
        <Timeout :staties="staties"></Timeout>
    </div>
</template>
<style lang="less" scoped>
.login {
    width: 100%;
    height: 100%;
    background: url(../../assets/login/login-bg.jpg) no-repeat center;
    background-size: cover;
    .form {
        width: 400px;
        height: 300px;
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
import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import Timeout from '@/components/Timeout.vue';
import { Staties, Check } from '@/types/store';

interface LoginRes {
    authorization: string;
    uid: number;
    nickname: string;
    level: number;
}

const checkUserName: Check = (rule, value, callback): void => {
    if (!value) return callback(new Error('Username can not be empty'));
    if (!/^[a-zA-Z]{4,20}$/g.test(value)) return callback(new Error('Username should be 4-20 English letters'));
    return callback();
};

const checkPassword: Check = (rule, value, callback): void => {
    if (!value) return callback(new Error('Password can not be empty'));
    if (!/^[A-Za-z\d@$!%*?&.]{6,16}$/.test(value)) return callback(new Error('Password should be 6-16'));
    return callback();
};

interface Form {
    userName: string;
    password: string;
}

@Component({
    components: {
        Timeout
    }
})
export default class Login extends Vue {
    private activeIndex = '1';

    private formData: Form = {
        userName: '',
        password: ''
    };

    private staties: Staties = {
        fromName: 'Login',
        toName: 'Home page',
        success: undefined,
        path: '/'
    };

    private rules = {
        userName: [{ validator: checkUserName, trigger: 'blur' }],
        password: [{ validator: checkPassword, trigger: 'blur' }]
    };

    public async login(formName: string) {
        (this.$refs[formName] as HTMLFormElement).validate(async (valid: boolean) => {
            if (!valid) return false;
            const res = await this.$axios<LoginRes>({
                method: 'post',
                url: '/auth/management-system/login',
                data: {
                    userName: this.formData.userName,
                    password: this.utils.Md5.hashStr(this.formData.password + 'dsc')
                }
            });
            const { data } = res;
            this.staties.success = true;
            const obj = {
                userId: data.uid,
                userName: data.nickname,
                level: data.level
            };
            this.$store.commit('changeLoginState', obj);
            sessionStorage.setItem('isLogin', '1');
            sessionStorage.setItem('userInfo', JSON.stringify(obj));
            localStorage.setItem('authToken', data.authorization);
        });
    }
}
</script>
