<template>
    <div class="zhezhao" v-if="staties.success !== undefined">
        <div>
            <p v-if="staties.success">{{ staties.fromName }} 成功, {{ time }} 后跳转 {{ staties.toName }}</p>
            <p v-else>{{ staties.fromName }} 失败, 请<a href="javascript:;" @click="handleClick">点击</a>再试一次</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Staties } from '@/types/store';
@Component
export default class Zhezhao extends Vue {
    @Prop(Object)
    public readonly staties!: Staties;

    private time = 3;

    private handleClick(): void {
        this.$router.push(this.staties.path);
    }

    @Watch('staties.success')
    changeState(): void {
        if (this.staties.success) this.count();
    }

    private count(): void {
        const timer = setInterval(() => {
            this.time--;
            if (this.time === 0) {
                clearInterval(timer);
                this.$router.push(this.staties.path);
            }
        }, 1000);
    }
}
</script>
<style lang="less" scoped>
.zhezhao {
    width: 100%;
    height: 100%;
    position: absolute;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000000;
    div {
        position: absolute;
        width: 500px;
        height: 300px;
        top: 50%;
        left: 50%;
        margin-left: -250px;
        margin-top: -150px;
        background: rgba(255, 255, 255, 0.7);
        z-index: 1000000;
        p {
            text-align: center;
            font-size: 24px;
            font-weight: 600;
            padding: 50px;
        }
    }
}
</style>