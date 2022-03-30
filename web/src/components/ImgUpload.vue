<template>
    <div>
        <!--suppress RequiredAttributes -->
        <el-upload
            ref="img-upload"
            :file-list="filesList"
            v-bind="$attrs"
            :http-request="uploadFiles"
            accept="image/*"
            :class="{ hide: hideUpload }"
        >
            <i slot="default" @click="add" class="el-icon-plus"></i>
            <div slot="file" slot-scope="{ file }">
                <div v-if="!onUpload">
                    <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                    <span class="el-upload-list__item-actions">
                        <span
                            v-if="sortType.includes('zoom')"
                            class="el-upload-list__item-preview"
                            @click="handlePictureCardPreview(file)"
                        >
                            <i class="el-icon-zoom-in"></i>
                        </span>
                        <span
                            v-if="sortType.includes('download')"
                            class="el-upload-list__item-delete"
                            @click="handleDownload(file)"
                        >
                            <i class="el-icon-download"></i>
                        </span>
                        <span
                            v-if="sortType.includes('remove')"
                            class="el-upload-list__item-delete"
                            @click="handleRemove(file)"
                        >
                            <i class="el-icon-delete"></i>
                        </span>
                        <span
                            v-if="sortType.includes('edit')"
                            class="el-upload-list__item-edit"
                            @click="handleEdit(file)"
                        >
                            <i class="el-icon-edit-outline"></i>
                        </span>
                    </span>
                </div>
                <div v-else>
                    <el-progress type="circle" :width="100" :percentage="process"></el-progress>
                </div>
            </div>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible" :modal="false">
            <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
    </div>
</template>
<script lang="ts">
import Dictionary from '@/api/dictionary';
import utils from '@/utils';
import { ElUploadInternalFileDetail, FileListItem, HttpRequestOptions } from 'element-ui/types/upload';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
    inheritAttrs: false
})
export default class extends Vue {
    @Prop({
        type: Number,
        default: 1
    })
    private maxCount = 1;

    @Prop()
    public value!: string[] | string;

    @Prop({
        type: Array,
        default() {
            return ['zoom', 'download', 'edit'];
        }
    })
    public sortType!: ('zoom' | 'download' | 'remove' | 'edit')[];

    @Watch('value', { immediate: true })
    public changeValue(value: string | string[]) {
        if (!utils.isEmpty(value)) {
            let newV: string | string[] = utils.deepClone(value);
            if (typeof newV === 'string') {
                newV = [newV];
            }
            this.filesList = [];
            (newV as string[]).forEach((v) => {
                if (v) {
                    // eslint-disable-next-line no-useless-escape
                    const filename = v.match(/(?<=(\/|\\))[^(\/|\\)]*$/g);
                    if (filename && filename.length) {
                        // const extname = filename[0].replace(/.*(?=\.)/, '');
                        this.filesList.push({
                            name: filename[0],
                            url: v
                        });
                    } else {
                        throw new ReferenceError('没有文件名');
                    }
                }
            });

            this.hideUpload = newV.filter((v) => v).length >= this.maxCount;
        }
    }

    public dialogImageUrl = '';
    public dialogVisible = false;
    public filesList: FileListItem[] = [];
    public hideUpload = false;
    public editFile: ElUploadInternalFileDetail | boolean = false;
    public process = 0;
    public onUpload = false;

    public add() {
        this.editFile = false;
    }

    public async uploadFiles(req: HttpRequestOptions) {
        const files = (this.$refs['img-upload'] as any).uploadFiles;
        this.onUpload = true;
        if (this.editFile) {
            const index = files.findIndex(
                (v: FileListItem) => v.url === (this.editFile as ElUploadInternalFileDetail).url
            );

            files.splice(index, 1);
            // this.changeUploadFiles(rmFile, files);
        }
        const { file } = req;
        const formData = new FormData();

        formData.append('file', file);

        try {
            const res = await Dictionary.uploadImg(formData, (e) => {
                this.process = ((e.loaded / e.total) * 100) | 0;
            });

            this.changeUploadFiles(file, res.data.url);
        } catch (error) {
            this.filesList = [...this.filesList];
        } finally {
            this.onUpload = false;
        }
    }
    public changeUploadFiles(
        file: ElUploadInternalFileDetail | File,
        filesList: ElUploadInternalFileDetail[] | string
    ) {
        if (typeof filesList === 'string') {
            this.$emit('input', filesList);
        } else if (filesList.length === 1) {
            this.$emit('input', filesList[0].url);
        } else {
            this.$emit('input', filesList.map((v) => v.url).length ? filesList.map((v) => v.url) : '');
        }
    }

    public handleRemove(file: ElUploadInternalFileDetail) {
        const files = (this.$refs['img-upload'] as any).uploadFiles;
        const index = files.findIndex((v: FileListItem) => v.url === file.url);

        const rmFile = files.splice(index, 1);
        this.changeUploadFiles(rmFile, files);
    }

    public handleEdit(file: ElUploadInternalFileDetail) {
        this.editFile = file;
        ((this.$refs['img-upload'] as Vue)?.$refs as any)['upload-inner'].handleClick();
    }

    public handlePictureCardPreview(file: ElUploadInternalFileDetail) {
        this.dialogImageUrl = file.url!;
        this.dialogVisible = true;
    }
    public async handleDownload(file: ElUploadInternalFileDetail) {
        const data = await Dictionary.downloadFileWithGet({ filename: file.name });
        // const a = document.createElement('a');
        console.log(data);
        // a.href = '/admin/dictionary/download?filename=' + file.name;
        // a.click();
        utils.downloadFile(file.name, data);
    }
}
</script>
<style lang="less" scoped>
/deep/ .hide .el-upload--picture-card {
    display: none;
}

/deep/ .el-upload-list--picture-card .el-upload-list__item {
    height: 100px !important;
    width: 100px !important;
}
/deep/ .el-upload--picture-card {
    height: 100px !important;
    width: 100px !important;
    line-height: 106px !important;
}

/deep/ .el-list-enter-active,
/deep/ .el-list-leave-active {
    transition: none;
}

/deep/ .el-upload-list--picture-card .el-progress {
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>
