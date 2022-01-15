<template>
    <el-form :model="formData" :rules="ruleForm" inline v-bind="getMyFormBind" ref="my-form">
        <el-row :gutter="20">
            <el-col v-for="item in options.columns" :key="item.dataIndex" :span="item.box || 8">
                <el-form-item v-bind="getMyFormItemBind(item)">
                    <ItemComponent v-model="formData[item.dataIndex]" :option="item"></ItemComponent>
                </el-form-item>
            </el-col>
        </el-row>
    </el-form>
</template>

<script lang="ts">
import { Check, Columns, EditForm, elRuleObject, MyDialogForm, RequiredRule } from '@/types/components';
import utils from '@/utils';
import { Component, InjectReactive, Prop, ProvideReactive, Vue, Watch } from 'vue-property-decorator';
import Config from './config';
import ItemConfig from './itemConfig';
import ItemComponent from './item.vue';
import { ElForm } from 'element-ui/types/form';

@Component({
    components: {
        ItemComponent
    }
})
export default class extends Vue {
    @Prop({
        type: Object,
        required: true
    })
    public option!: MyDialogForm;

    @InjectReactive({
        from: 'MyTable',
        default: null
    })
    public readonly MyTable!: Vue & { [K in keyof any]: any };

    @ProvideReactive('myForm')
    public myForm = this;

    @ProvideReactive('formOptions')
    public options!: MyDialogForm;

    public formData: Record<string, any> = {};

    public ruleForm: Record<string, any> = {};

    private config;

    private itemConfig;

    // 代办
    // tableData 表格数据

    public constructor() {
        super();
        this.config = new Config();
        this.itemConfig = new ItemConfig();
    }

    public get getMyFormBind() {
        const obj = utils.deepClone(this.config.default);
        for (const i in this.options) {
            if (this.config.bind.includes(i)) {
                obj[i] = this.options[i];
            }
        }

        return obj;
    }

    // tableDataIndex 当前操作栏index
    @Watch('option', { immediate: true, deep: true })
    public async onOptionChange() {
        this.options = utils.deepClone(this.option);
        this.formData = {};
        let formData = {};

        if (this.isEditForm(this.options)) {
            let params;
            let tableData;
            let tableDataIndex;
            if (this.MyTable) {
                tableData = this.MyTable.tableData;
                tableDataIndex = this.MyTable.tableDataIndex;
            }
            if (this.options.viewParams) {
                if (typeof this.options.viewParams === 'function') {
                    params = await this.options.viewParams.call(this, tableData, tableDataIndex);
                } else {
                    params = this.options.viewParams;
                }
            }

            let { data } = await this.options.viewStore(params);

            if (this.options.beforeRender) {
                data = await this.options.beforeRender.call(this, data);
            }

            formData = {
                ...data
            };
        }
        for (const v of this.options.columns) {
            const map = this.itemConfig.typeMap;
            const option = map.get(v.xType);

            if (v.required) {
                const rule = this.initRule(v);
                if (rule) {
                    this.$set(this.ruleForm, v.dataIndex, rule);
                    // this.ruleForm[v.dataIndex] = rule;
                }
            }

            if (v.value) {
                formData[v.dataIndex] = v.value;
            }
            if (utils.isEmpty(formData[v.dataIndex])) {
                formData[v.dataIndex] = option?.defaultValue(v as any);
            }

            v.beforeRender &&
                (formData[v.dataIndex] = (v.beforeRender as any).call(
                    this,
                    formData[v.dataIndex],
                    v as any,
                    this.options.columns,
                    this.MyTable
                ));
        }
        this.formData = formData;
        this.$forceUpdate();
    }

    public async commit() {
        return new Promise((resolve, reject) => {
            (this.$refs['my-form'] as ElForm).validate(async (valid) => {
                if (!valid) {
                    reject(valid);
                } else {
                    const { store } = this.options;
                    let params = utils.deepClone(this.formData);

                    if (this.isEditForm(this.options)) {
                        if (this.options.beforeCommit) {
                            const format = this.options.beforeCommit.call(
                                this,
                                params,
                                this.options as any,
                                this.MyTable
                            );

                            if (format === false) {
                                return;
                            } else {
                                params = format;
                            }
                        }
                    }

                    try {
                        const res = await store(params);

                        if (this.options.afterCommit && typeof this.options.afterCommit === 'function') {
                            await (this.options.afterCommit as any).call(this, res.data, this.options, this.MyTable);
                        } else {
                            await this.$alert('提交成功', '提示', {
                                type: 'success'
                            });
                        }
                        resolve(res);
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        });
    }

    public getMyFormItemBind(item: Columns) {
        const obj = {};
        for (const i in item) {
            if (this.config.formItemBind.includes(i)) {
                obj[i] = item[i];
            }
        }

        obj['prop'] = item.dataIndex;
        return obj;
    }

    private isEditForm(obj: any): obj is EditForm {
        return obj.type === 'edit';
    }

    private initRule(v: Columns) {
        if (typeof v.required === 'object') {
            const { handle, trigger, message } = v.required;
            return [this.getRule(v, handle as any, message, trigger)];
        } else {
            return [this.getRule(v, v.required as any)];
        }
    }

    private getRule<T>(v: Columns, handle: RequiredRule<T>, message?: string, trigger = 'blur'): elRuleObject | false {
        message = message ?? `请输入${v.label.replace('：', '')}`;
        if (typeof handle === 'boolean' && handle) {
            return {
                required: true,
                message,
                trigger
            };
        } else if (typeof handle === 'string') {
            switch (handle) {
                case 'number':
                    return {
                        validator: this.validatorFun(v, false, message, /\d/),
                        trigger
                    };
                case '!number':
                    return {
                        validator: this.validatorFun(v, true, message, /\d/),
                        trigger
                    };
                case 'IdCard':
                    return {
                        validator: this.validatorFun(
                            v,
                            false,
                            message,
                            /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx]$/
                        ),
                        trigger
                    };
                case '!IdCard':
                    return {
                        validator: this.validatorFun(
                            v,
                            true,
                            message,
                            /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx]$/
                        ),
                        trigger
                    };
                case 'chinese':
                    return {
                        validator: this.validatorFun(
                            v,
                            false,
                            message,
                            /^(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])+$/
                        ),
                        trigger
                    };
                case '!chinese':
                    return {
                        validator: this.validatorFun(
                            v,
                            true,
                            message,
                            /^(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])+$/
                        ),
                        trigger
                    };
                case 'phone':
                    return {
                        validator: this.validatorFun(
                            v,
                            false,
                            message,
                            /^(?:(?:\+|00)86)?1(?:(3[\d])|(4[5-79])|(5[0-35-9])|(6[5-7])|(7[0-8])|(8[\d])|(9[189]))\d{8}$/
                        ),
                        trigger
                    };
                case '!phone':
                    return {
                        validator: this.validatorFun(
                            v,
                            true,
                            message,
                            /^(?:(?:\+|00)86)?1(?:(3[\d])|(4[5-79])|(5[0-35-9])|(6[5-7])|(7[0-8])|(8[\d])|(9[189]))\d{8}$/
                        ),
                        trigger
                    };
            }
        } else if (typeof handle === 'function') {
            return { validator: this.validatorFun(v, handle as any, message), trigger: trigger };
        } else {
            return false;
        }
    }

    private validatorFun(
        v: Columns,
        required:
            | boolean
            | ((
                  value: any,
                  options: Columns,
                  option: Columns[],
                  table: Vue & { [x: string]: any }
              ) => string | boolean),
        message: string,
        reg?: RegExp
    ): Check {
        if (required instanceof Function) {
            return (rule, value, callback) => {
                const o = required.call(this, value, v, this.options.columns, this.MyTable);
                if (o === true) callback();
                else if (typeof o === 'string') {
                    callback(new Error(o as string));
                } else if (!o) {
                    callback(new Error(message));
                }
            };
        }
        return (rule, value, callback) => {
            if (required) {
                if (!value || !reg?.test(value)) {
                    callback(new Error(message));
                } else {
                    callback();
                }
            } else {
                if (value !== null && value !== undefined && value !== '' && !reg?.test(value)) {
                    callback(new Error(message));
                } else {
                    callback();
                }
            }
        };
    }
}
</script>

<style lang="less" scoped>
.el-form-item {
    display: flex;
}
</style>
