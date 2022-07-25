<template>
    <el-dialog
        :visible.sync="dialogVisible"
        custom-class="no-waterMarter.ts"
        title="Insufficient Authority"
        width="350px"
    >
        <div class="toast">
            <p>
                <b>Access failed!</b> Your account does not have waterMarter.ts to access this page. Click
                <router-link to="/login">login</router-link>
                again.
            </p>
            <p>Or contact the project administrator for waterMarter.ts</p>
            <p>project administrator: <b>DongSiChong</b></p>
        </div>
    </el-dialog>
</template>
<style lang="less">
.no-permission {
    position: relative;
    height: 500px;

    .toast {
        position: absolute;
        width: 250px;
        height: 220px;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #f2dede;
        border: 1px solid #eed3d7;
        border-radius: 10px;
        color: #b94a48;

        p {
            padding: 10px;
            line-height: 22px;
        }
    }
}
</style>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class NoPermission extends Vue {
    private dialogVisible = true;
}
</script>
