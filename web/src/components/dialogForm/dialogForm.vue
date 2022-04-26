<template>
    <el-dialog
        v-bind="getDialogOptionsBind"
        v-if="options.form ? (options.form.type === 'del' ? false : visible) : visible"
        :visible.sync="visible"
    >
        <MyForm ref="myForm" :option="options.form"></MyForm>
        <span slot="footer" class="dialog-footer">
            <el-button @click="beforeClose(options.beforeClose)()">取 消</el-button>
            <el-button type="primary" @click="commitForm">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script lang="ts">
import { Component, Inject, InjectReactive, Prop, ProvideReactive, Vue, Watch } from 'vue-property-decorator';
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

    @Inject({
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
    public onOptionChange() {
        this.options = utils.deepClone(this.option);
        const form = this.options.form;
        this.thisArg = this.controller ?? this;
        if (this.isDelForm(form)) {
            this.show = async () => {
                let message = '';
                if (form.message) {
                    if (typeof form.message === 'string') {
                        message = form.message;
                    } else if (typeof form.message === 'function') {
                        message = form.message.call(this.thisArg, this.tableColumnData, form, this.myTable);
                    }
                } else {
                    message = '确定要删除此项吗？';
                }
                try {
                    await this.$msgbox({
                        type: 'warning',
                        message,
                        title: '提示',
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        showCancelButton: true,
                        ...form.confirm,
                        beforeClose: (action, instance, done) => {
                            if (action === 'cancel' || action === 'close') {
                                if (typeof this.options.beforeClose === 'function') {
                                    const res = this.options.beforeClose.call(this.thisArg, this.options);
                                    if (!res) {
                                        return;
                                    }
                                }
                            }
                            done();
                        }
                    });
                    const { store, beforeCommit, afterCommit } = form;

                    const params = (beforeCommit &&
                        beforeCommit.call(this.thisArg, this.tableColumnData, form, this.myTable)) || {
                        id: this.tableColumnData?.id
                    };

                    const res = await store(params);

                    afterCommit &&
                        typeof afterCommit === 'function' &&
                        afterCommit.call(this.thisArg, res, form, this.myTable);
                    !form?.hideSuccessTips &&
                        (await this.$alert('提交成功', '提示', {
                            type: 'success'
                        }));
                    this.$emit('refresh');
                } catch (e) {
                    //
                }
            };
        }
    }

    public get getDialogOptionsBind() {
        const obj = utils.deepClone(this.config.default);
        if (!utils.isEmpty(this.options.form)) {
            switch (this.options.form!.type) {
                case 'view':
                    obj.title = '查看';
                    break;
                case 'edit':
                    obj.title = '编辑';
                    break;
                case 'add':
                    obj.title = '新增';
                    break;
            }
        }
        for (const i in this.options) {
            if (this.config.bind.includes(i)) {
                if (i === 'beforeClose') {
                    obj[i] = this.beforeClose.call(this.thisArg, this.options.beforeClose as any);
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
            const res = await (this.$refs['myForm'] as any).commit();
            this.visible = false;
            if (res !== 'no-refresh') {
                this.$emit('refresh');
            }
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
