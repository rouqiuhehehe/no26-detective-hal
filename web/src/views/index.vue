<template>
    <el-container class="container">
        <el-header class="container-header">
            <h1 @click="handleClick"><img src="../assets/logo.jpg" />26号探案馆管理后台</h1>
            <el-dropdown class="dropdown" @command="handleCommand">
                <span class="el-dropdown-link">
                    <em>{{ userName }}</em
                    ><i class="el-icon-arrow-down el-icon--right" style="margin-left: 10px"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="setting" icon="el-icon-user">个人信息</el-dropdown-item>
                    <el-dropdown-item command="signOut" divided>退出登陆</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </el-header>
        <el-container>
            <!-- <el-scrollbar style="overflow-x: hidden">

            </el-scrollbar> -->
            <el-aside style="width: 250px; overflow: hidden">
                <Menu :menu-tree="asideTree"></Menu>
            </el-aside>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script lang="ts">
import { UserInfo } from '@/types/store';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import Menu from '@/components/Menu.vue';
import { AsideTree } from '@/types/routes';
import { Mutation } from 'vuex';
import userOperation from '@/api/auth/user-operation';
import router from '@/router';

const user = namespace('user');
const aside = namespace('routes');
@Component({
    components: {
        Menu
    }
})
export default class Home extends Vue {
    public userName = '';

    //   private navConfig = navConfig;
    @user.Getter
    private userInfo!: UserInfo;

    @user.Mutation
    private CHANGE_USER_INFO!: Mutation<Partial<UserInfo>>;

    @aside.Getter
    public asideTree!: AsideTree;

    public async mounted() {
        if (this.userInfo) {
            this.userName = this.userInfo.nickname;
        }
    }

    public handleCommand(command: string): void {
        if (command === 'setting') this.$router.push('/setting');
        else if (command === 'signOut') this.signOut();
    }

    public handleClick(): void {
        this.$router.push('/');
    }

    private signOut(): void {
        this.$confirm('确定退出登录？', '提示', {
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning'
        })
            .then(async () => {
                await userOperation.loginOut();
                this.CHANGE_USER_INFO({});
                sessionStorage.removeItem('token');
                this.$router.go(0);
            })
            .catch(() => {
                return false;
            });
    }
}
</script>
<style lang="less">
.container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .container-header {
        line-height: 60px;
        h1 {
            float: left;
            cursor: pointer;
            img {
                width: 35px;
                height: 35px;
                margin-right: 10px;
                vertical-align: sub;
            }
        }
        .dropdown {
            float: right;
            cursor: pointer;
            height: 40px;
            &:hover {
                color: #409eff;
            }
            .el-dropdown-link em {
                font-weight: 600;
                font-style: normal;
                margin-right: 10px;
            }
        }
    }

    .el-scrollbar__wrap {
        overflow-x: hidden;
    }
    .el-aside {
        .fl-be {
            position: absolute;
            left: 20px;
        }
    }
}
</style>