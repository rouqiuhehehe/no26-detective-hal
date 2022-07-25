<template>
    <el-menu :default-active="$route.path" class="el-menu-vertical-demo" router>
        <component
            :is="value.children && value.children.length ? 'el-submenu' : 'el-menu-item'"
            v-for="value in menuTree"
            :key="value.name"
            :class="{
                'has-child-router': value.children && value.children.length
            }"
            :index="value.path"
        >
            <template slot="title">
                <i :class="value.icon"></i>
                <span>{{ value.title }}</span>
            </template>
            <template v-if="value.children && value.children.length">
                <Menu :menu-tree="value.children"></Menu>
            </template>
        </component>
    </el-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AsideTree } from '@/types/routes';

@Component({
    name: 'Menu'
})
export default class extends Vue {
    @Prop({
        type: Array,
        required: true
    })
    menuTree!: AsideTree;

    // public mounted() {}
}
</script>

<style lang="less" scoped>
.el-menu {
    text-align: center;
}

.has-child-router {
    background: #eeeeee33;
}

.is-opened {
    background: #eeeeee99;
}

///deep/ .el-submenu.is-opened > .el-submenu__title .el-submenu__icon-arrow {
//    display: none;
//}
//
///deep/ .el-submenu > .el-submenu__title .el-submenu__icon-arrow {
//    display: none;
//}

/deep/ .el-menu-item {
    padding: 0 20px !important;
}
</style>
