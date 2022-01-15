<template>
    <el-dialog v-bind="getDialogOptionsBind" v-if="visible" :visible.sync="visible">
        <MyForm ref="myForm" :option="options.form"></MyForm>
        <span slot="footer" class="dialog-footer">
            <el-button @click="beforeClose()()">取 消</el-button>
            <el-button type="primary" @click="commitForm">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { MyDialog } from '@/types/components';
import utils from '@/utils';
import Config from './config';
import autoBind from '@/descriptors/Autobind';
import MyForm from '../form/form.vue';

@Component({
    components: {
        MyForm
    }
})
export default class extends Vue {
    @Prop({
        type: Object,
        required: true
    })
    public option!: MyDialog;

    public options!: MyDialog;

    public config;
    public visible = false;

    public constructor() {
        super();
        this.config = new Config({
            beforeClose: this.beforeClose
        });
    }

    @Watch('option', { immediate: true, deep: true })
    public onOptionChange() {
        this.options = utils.deepClone(this.option);
    }

    public get getDialogOptionsBind() {
        const obj = utils.deepClone(this.config.default);
        for (const i in this.options) {
            if (this.config.bind.includes(i)) {
                if (i === 'beforeClose') {
                    obj[i] = this.beforeClose.call(this, this.options.beforeClose as any);
                    this.beforeClose = this.beforeClose.bind(this, this.options.beforeClose as any);
                } else {
                    obj[i] = this.options[i];
                }
            }
        }

        return obj;
    }

    @autoBind
    public beforeClose(beforeClose?: (options: MyDialog) => boolean) {
        return (done?: () => void) => {
            let res = true;
            if (beforeClose) {
                res = beforeClose.call(this, this.options);
            }
            if (res) {
                if (done) {
                    done();
                } else {
                    this.visible = false;
                }
            }
        };
    }

    public async commitForm() {
        try {
            await (this.$refs['myForm'] as any).commit();
            this.visible = false;
        } catch (e) {
            //
        }
    }

    public show() {
        this.visible = true;
    }

    // @Prop({
    //     type: Array,
    //     required: true
    // })
    // menuTree!: AsideTree;
    // public mounted() {}
}
</script>

<style lang="less" scoped></style>
