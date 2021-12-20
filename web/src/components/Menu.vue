<template>
    <el-menu :default-active="$route.path" router class="el-menu-vertical-demo">
        <component
            v-for="value in menuTree"
            :key="value.name"
            :is="value.children && value.children.length ? 'el-submenu' : 'el-menu-item'"
            :index="value.path"
            :class="$route.path.includes(value.path) ? 'is-active' : ''"
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

<style>
</style>