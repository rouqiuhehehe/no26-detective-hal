<template>
    <!--suppress JSUnresolvedVariable -->
    <component
        v-if="options.xType === 'component'"
        :is="runFnComponent(options.component.component, value, formdata, options)"
        v-bind="runFnComponent(options.component.bind, value, formdata, options)"
        v-on="runFnComponent(options.component.events, value, formdata, options)"
        :value="value"
        @input="$listeners.input"
    ></component>
    <div v-else-if="itemConfig.component === 'div'" v-html="thisVal"></div>
    <component
        v-else
        :is="itemConfig.component"
        :value="thisVal"
        @input="$listeners.input"
        v-on="getMyItemEvents"
        v-bind="getMyItemBind"
    >
        <template v-if="options.xType === 'select'">
            <el-option
                v-for="item in allData"
                :key="options.formatKey ? item[options.formatKey.key] : item.key"
                :label="options.formatKey ? item[options.formatKey.value] : item.value"
                :value="options.formatKey ? item[options.formatKey.key] : item.key"
            >
            </el-option>
        </template>
        <template v-if="options.xType === 'checkboxGroup'">
            <el-checkbox
                v-for="item in allData"
                :key="options.formatKey ? item[options.formatKey.key] : item.key"
                :label="options.formatKey ? item[options.formatKey.key] : item.key"
                >{{ options.formatKey ? item[options.formatKey.value] : item.value }}</el-checkbox
            >
        </template>
        <template v-if="options.xType === 'radio'">
            <el-radio
                v-for="item in allData"
                :key="options.formatKey ? item[options.formatKey.key] : item.key"
                :label="options.formatKey ? item[options.formatKey.key] : item.key"
            >
                {{ options.formatKey ? item[options.formatKey.value] : item.value }}
            </el-radio>
        </template>
    </component>
</template>

<script lang="ts">
import { Columns, ELEvent, MyDialogForm } from '@/types/components';
import utils from '@/utils';
import { Component, Inject, InjectReactive, Prop, Vue, Watch } from 'vue-property-decorator';
import ItemConfig from './itemConfig';
import imgUpload from '../ImgUpload.vue';

const itemConfig = new ItemConfig();
@Component({
    components: {
        'img-upload': imgUpload
    }
})
export default class extends Vue {
    @Prop({
        type: Object,
        required: true
    })
    public option!: Columns;

    @Prop()
    public value!: any;

    @Prop()
    public formdata!: Record<string, any>;

    @InjectReactive({
        from: 'myForm',
        default: {}
    })
    private readonly myForm!: MyDialogForm;

    @Inject({
        from: 'thisArg',
        default: null
    })
    private controller?: Vue;

    @InjectReactive({
        from: 'myTable',
        default: {}
    })
    public readonly MyTable?: Vue & { [K in keyof any]: any };

    public thisArg!: Vue;

    public allData?: any[] = [];

    public options!: Columns;

    public itemConfig: ReturnType<typeof itemConfig.typeMap.get>;

    public thisVal = '';

    @Watch('value', { immediate: true })
    public onValueChange(v: any) {
        (this.options &&
            this.options.xType !== 'component' &&
            this.options.beforeRender &&
            (this.thisVal = (this.options.beforeRender as any).call(
                this.thisArg,
                utils.deepClone(v),
                utils.deepClone(this.formdata),
                this.options,
                this.myForm,
                this.MyTable
            ))) ||
            (this.thisVal = v);
    }

    @Watch('option', { immediate: true, deep: true })
    public async onOptionChange() {
        this.options = utils.deepClone(this.option);
        this.thisArg = this.controller ?? this;

        this.itemConfig = itemConfig.typeMap.get(this.options.xType);
        let data;
        if (
            this.options.xType === 'select' ||
            this.options.xType === 'cascader' ||
            this.options.xType === 'checkboxGroup' ||
            this.options.xType === 'radio'
        ) {
            if (typeof this.options.store === 'function') {
                let params;
                if (this.options.params) {
                    if (typeof this.options.params === 'function' && this.myForm.type !== 'del') {
                        params = await (this.options.params as any).call(
                            this,
                            this.options,
                            this.myForm.columns,
                            this.myForm
                        );
                    }
                }
                data = (await this.options.store.call(this, params)).data;
            } else {
                data = this.options.store;
            }

            this.allData = data;
            this.$forceUpdate();
        }
    }

    public get getMyItemEvents() {
        const obj = {} as ELEvent;

        if (this.options.xType !== 'text' && this.options.xType !== 'component') {
            for (const i in this.options.events) {
                if ((this.itemConfig?.events as string[])?.includes(i)) {
                    obj[i] = this.options.events[i];
                }
            }
        }

        return obj;
    }

    public get getMyItemBind() {
        const obj = utils.deepClone(this.itemConfig?.defaultBind) ?? {};

        for (const i in this.options) {
            if ((this.itemConfig?.bind as string[])?.includes(i)) {
                obj[i] = this.options[i];
            }
        }
        if (this.myForm.type === 'view' && (this.itemConfig?.bind as string[])?.includes('disabled')) {
            obj['disabled'] = obj['disabled'] ?? true;
        }
        return obj;
    }

    public runFnComponent(fn: any, ...arg: any[]) {
        if (fn) {
            return utils.runFnComponent(
                this.thisArg,
                (typeof fn === 'function' ? fn.toString() : JSON.stringify(fn)) + arg[0]
            )(fn, ...arg);
        } else {
            return fn;
        }
    }
}
</script>

<style></style>
