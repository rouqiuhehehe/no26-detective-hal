<template>
    <div>
        <el-dialog
            :visible.sync="show"
            :title="option.title || '导入'"
            :before-close="() => $emit('update:show', false)"
        >
            <el-upload
                ref="upload"
                class="upload-demo"
                drag
                action="#"
                :accept="option.accept"
                :limit="1"
                :http-request="importFile"
                :on-remove="clearFile"
            >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传{{ getAccept(option.accept) }}文件，且不超过500kb</div>
                <div class="upload-header">
                    <span @click.stop="downloadTemplate(option.template.store)">
                        文件模板下载：
                        <span style="color: #409eff">{{ option.template.title }}</span>
                    </span>
                    <el-button v-if="!file" size="small" type="primary" class="pick-file">选取文件</el-button>
                    <el-button v-else size="small" type="primary" class="pick-file" @click.stop="clearFile"
                        >清除文件</el-button
                    >
                </div>
            </el-upload>
            <span slot="footer" class="dialog-footer">
                <el-button @click="$emit('update:show', false)">取 消</el-button>
                <el-button type="primary" :disabled="commitBtnDisabled" @click="commitForm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { HttpRequestOptions } from 'element-ui/types/upload';
import { MyFileImport } from '@/types/components';

@Component({
    name: 'Import'
})
export default class extends Vue {
    @Prop()
    public show!: boolean;

    @Prop({
        type: Object,
        required: true
    })
    public option!: MyFileImport;

    @Watch('file')
    public changeBtnStatus() {
        this.commitBtnDisabled = !this.file;
    }

    public file: File | null = null;

    public commitBtnDisabled = true;

    public getAccept(accept: string) {
        return accept.replace(/\./g, '').replace(/,/, '/');
    }

    public importFile({ file }: HttpRequestOptions) {
        this.file = file;
    }

    public clearFile() {
        (this.$refs?.upload as any)?.clearFiles();
        this.file = null;
    }

    public async downloadTemplate() {
        await this.option.template?.store(null);
    }

    public async commitForm() {
        const formData = new FormData();
        formData.append('file', this.file!);
        await this.option.store?.(formData);
        this.$emit('update:show', false);
        this.$emit('after-commit');
    }
}
</script>

<style lang="less" scoped>
.upload-demo {
    padding-top: 50px;

    ::v-deep .el-upload {
        width: 100%;

        .el-upload-dragger {
            overflow: visible;
            width: 100%;
        }
    }

    .upload-header {
        width: 100%;
        align-items: center;
        position: absolute;
        left: 0;
        top: -50px;
        display: flex;
        justify-content: space-between;
    }
}
</style>
