<template>
    <div v-if="itemConfig.component === 'div'" v-html="value"></div>
    <component
        v-else
        :is="itemConfig.component"
        :value="value"
        @input="$listeners.input"
        v-on="getMyItemEvents"
        v-bind="getMyItemBind"
    >
        <template v-if="this.options.xType === 'select'">
            <el-option
                v-for="item in allData"
                :key="options.formatKey ? item[options.formatKey.key] : item.key"
                :label="options.formatKey ? item[options.formatKey.value] : item.value"
                :value="options.formatKey ? item[options.formatKey.key] : item.key"
            >
            </el-option>
        </template>
        <template v-if="this.options.xType === 'checkboxGroup'">
            <el-checkbox
                v-for="item in allData"
                :key="options.formatKey ? item[options.formatKey.key] : item.key"
                :label="options.formatKey ? item[options.formatKey.key] : item.key"
                >{{ options.formatKey ? item[options.formatKey.value] : item.value }}</el-checkbox
            >
        </template>
    </component>
</template>

<script lang="ts">
import { Columns, ELEvent, MyDialogForm } from '@/types/components';
import utils from '@/utils';
import { Component, InjectReactive, Prop, Vue, Watch } from 'vue-property-decorator';
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

    @InjectReactive({
        from: 'myForm',
        default: {}
    })
    private readonly myForm!: MyDialogForm;
    public allData?: any[];

    public options!: Columns;

    public itemConfig: ReturnType<typeof itemConfig.typeMap.get>;

    @Watch('option', { immediate: true, deep: true })
    public async onOptionChange() {
        this.options = utils.deepClone(this.option);

        this.itemConfig = itemConfig.typeMap.get(this.options.xType);

        let data;
        if (
            this.options.xType === 'select' ||
            this.options.xType === 'cascader' ||
            this.options.xType === 'checkboxGroup'
        ) {
            if (typeof this.options.store === 'function') {
                let params;
                if (this.options.params) {
                    if (typeof this.options.params === 'function') {
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
        }
    }

    public get getMyItemEvents() {
        const obj = {} as ELEvent;

        if (this.options.xType !== 'text') {
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

        return obj;
    }
}
</script>

<style></style>
