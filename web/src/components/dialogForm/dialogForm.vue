<template>
    <el-dialog
        v-bind="getDialogOptionsBind"
        v-if="options.form ? (options.form.type === 'del' ? false : visible) : visible"
        :visible.sync="visible"
    >
        <MyForm ref="myForm" :option="options.form"></MyForm>
        <span slot="footer" class="dialog-footer">
            <el-button @click="beforeClose()()">取 消</el-button>
            <el-button type="primary" @click="commitForm">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script lang="ts">
import { Component, InjectReactive, Prop, ProvideReactive, Vue, Watch } from 'vue-property-decorator';
import { DelForm, MyDialog } from '@/types/components';
import utils from '@/utils';
import Config from './config';
import autoBind from '@/descriptors/Autobind';
import MyForm from '../form/form.vue';

@Component({
    name: 'MyDialogForm',
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

    @InjectReactive({
        from: 'myTable',
        default: null
    })
    public myTable?: Vue & { [K in keyof any]: any };

    @InjectReactive({
        from: 'tableColumnData',
        default: null
    })
    public tableColumnData?: Record<string, any>;

    @InjectReactive({
        from: 'thisArg',
        default: null
    })
    private readonly controller?: Vue;

    @ProvideReactive('myDialogForm')
    public myDialogForm = this;

    public thisArg!: Vue;

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
    public async onOptionChange() {
        this.options = utils.deepClone(this.option);
        const form = this.options.form;
        this.thisArg = this.controller ?? this;

        if (this.isDelForm(form)) {
            try {
                await this.$msgbox({
                    type: 'warning',
                    message: '确定要删除此项吗',
                    title: '提示',
                    ...form.confirm
                });
                const { store, beforeCommit, afterCommit } = form;

                const params =
                    (beforeCommit &&
                        beforeCommit.call(this.thisArg, this.tableColumnData, this.options as DelForm, this.myTable)) ||
                    null;

                const res = await store(params);

                afterCommit && afterCommit.call(this.thisArg, res, this.options as DelForm, this.myTable);
            } catch (e) {
                //
            }
        }
    }

    public get getDialogOptionsBind() {
        const obj = utils.deepClone(this.config.default);
        for (const i in this.options) {
            if (this.config.bind.includes(i)) {
                if (i === 'beforeClose') {
                    obj[i] = this.beforeClose.call(this.thisArg, this.options.beforeClose as any);
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
                res = beforeClose.call(this.thisArg, this.options);
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

    private isDelForm(obj: any): obj is DelForm {
        return obj?.type === 'del';
    }
}
</script>

<style lang="less" scoped></style>
