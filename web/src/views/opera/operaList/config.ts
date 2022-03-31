import { MyForm, MyTable } from '@/types/components';
import operaList from '@/api/opera/operaList';
import Vue, { VNode } from 'vue';
import { CreateElement } from 'vue/types/vue';
import Util from '@/utils';
import Dictionary from '@/api/dictionary';

export default class {
    public get tableOptions() {
        const option: MyTable = {
            page: {
                pageSize: 5,
                pageSizes: [5, 10, 20, 30]
            },
            search: this.searchOptions,
            buttons: [],
            title: '所有剧本',
            header: [
                {
                    label: '首页',
                    path: '/'
                },
                {
                    label: '剧本类'
                },
                {
                    label: '所有剧本'
                }
            ],
            store: operaList.getOperaList,
            beforeSearch(v) {
                if (v.person) {
                    v.woman = v.person.woman;
                    v.man = v.person.man;
                    Reflect.deleteProperty(v, 'person');
                }
                if (v.is_city_limit && v.is_city_limit.length) {
                    v.is_city_limit = v.is_city_limit[0];
                }
                return v;
            },
            columns: [
                {
                    label: '剧本id',
                    dataIndex: 'id'
                },
                {
                    label: '剧本名',
                    dataIndex: 'name'
                },
                {
                    label: '图片',
                    dataIndex: 'picUrl',
                    component: {
                        component: 'el-image',
                        bind(v: string) {
                            return {
                                src: v,
                                style: 'width: 50px;height: 50px;',
                                previewSrcList: [v]
                            };
                        }
                    }
                },
                {
                    label: '人员配置',
                    dataIndex: 'man',
                    beforeRender(v, row) {
                        return `${v}男${row.woman}女`;
                    }
                },
                {
                    label: '难度',
                    dataIndex: 'difficulty',
                    beforeRender(v) {
                        const span = Util.colorSpan;
                        switch (v) {
                            case 1:
                                return span('#409EFF', '新手');
                            case 2:
                                return span('#E6A23C', '进阶');
                            case 3:
                                return span('#F56C6C', '烧脑');
                        }
                    }
                },

                {
                    label: '城市限定',
                    dataIndex: 'isCityLimit',
                    beforeRender(v: number) {
                        return v === 0 ? Util.colorSpan('#909399', '否') : Util.colorSpan('#409EFF', '是');
                    }
                },
                {
                    label: '独家',
                    dataIndex: 'isExclusive',
                    beforeRender(v: number) {
                        return v === 0 ? Util.colorSpan('#909399', '否') : Util.colorSpan('#409EFF', '是');
                    }
                }
            ],
            operation: {
                fixed: 'right',
                button: [
                    {
                        dataIndex: 'view',
                        form: {
                            labelWidth: '100px',
                            labelWithColon: true,
                            type: 'view',
                            viewStore: operaList.getOperaListView,
                            viewParams(v) {
                                return {
                                    id: v!.id
                                };
                            },
                            columns: [
                                {
                                    xType: 'input',
                                    dataIndex: 'id',
                                    label: '剧本id',
                                    box: 6
                                },
                                {
                                    xType: 'input',
                                    box: 6,
                                    label: '剧本名',
                                    dataIndex: 'name'
                                },
                                {
                                    label: '图片',
                                    dataIndex: 'pic_url',
                                    xType: 'component',
                                    box: 4,
                                    component: {
                                        component: 'el-image',
                                        bind(v: string) {
                                            return {
                                                src: v,
                                                style: 'width: 50px;height: 50px;',
                                                previewSrcList: [v]
                                            };
                                        }
                                    }
                                },
                                {
                                    label: '标签',
                                    dataIndex: 'default_catalogs_names',
                                    xType: 'component',
                                    box: 8,
                                    component: {
                                        component: this.labelComponent
                                    }
                                },
                                {
                                    label: '人员配置',
                                    xType: 'text',
                                    box: 4,
                                    dataIndex: 'man',
                                    beforeRender(v, row) {
                                        return `${v}男${row.woman}女`;
                                    }
                                },
                                {
                                    label: '难度',
                                    dataIndex: 'difficulty',
                                    xType: 'text',
                                    box: 4,
                                    beforeRender(v) {
                                        const span = Util.colorSpan;
                                        switch (v) {
                                            case 1:
                                                return span('#409EFF', '新手');
                                            case 2:
                                                return span('#E6A23C', '进阶');
                                            case 3:
                                                return span('#F56C6C', '烧脑');
                                        }
                                    }
                                },
                                {
                                    label: '店家推荐',
                                    dataIndex: 'recommend',
                                    xType: 'component',
                                    box: 8,
                                    component: {
                                        component: this.recommendComponent
                                    }
                                },
                                {
                                    label: '城市限定',
                                    dataIndex: 'is_city_limit',
                                    xType: 'text',
                                    box: 4,
                                    beforeRender(v: number) {
                                        return v === 0
                                            ? Util.colorSpan('#909399', '否')
                                            : Util.colorSpan('#409EFF', '是');
                                    }
                                },
                                {
                                    label: '独家',
                                    xType: 'text',
                                    dataIndex: 'is_exclusive',
                                    box: 4,
                                    beforeRender(v: number) {
                                        return v === 0
                                            ? Util.colorSpan('#909399', '否')
                                            : Util.colorSpan('#409EFF', '是');
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        };

        return option;
    }

    public get searchOptions() {
        const option: Omit<MyForm, 'type'> = {
            columns: [
                {
                    label: '剧本名',
                    placeholder: '请输入剧本名',
                    dataIndex: 'name',
                    xType: 'input',
                    box: 4
                },
                {
                    label: '人员配置',
                    dataIndex: 'person',
                    xType: 'component',
                    box: 4,
                    component: {
                        component() {
                            return Vue.extend({
                                props: {
                                    value: {
                                        default() {
                                            return {
                                                man: undefined,
                                                woman: undefined
                                            };
                                        }
                                    }
                                },
                                render(createElement: CreateElement): VNode {
                                    // eslint-disable-next-line @typescript-eslint/no-this-alias
                                    const self = this;
                                    const inputNumber = (type: 'man' | 'woman') =>
                                        createElement('el-input-number', {
                                            props: {
                                                controlsPosition: 'right',
                                                value: self.value[type],
                                                size: 'mini',
                                                controls: false,
                                                min: 0,
                                                max: 10
                                            },
                                            on: {
                                                change(v: number) {
                                                    self.$emit('input', {
                                                        ...self.value,
                                                        [type]: v
                                                    });
                                                }
                                            }
                                        });
                                    const span = (label: '男' | '女') =>
                                        createElement(
                                            'span',
                                            {
                                                style: {
                                                    margin: '0 10px'
                                                }
                                            },
                                            label
                                        );
                                    return createElement('div', [
                                        inputNumber('man'),
                                        span('男'),
                                        inputNumber('woman'),
                                        span('女')
                                    ]);
                                }
                            });
                        }
                    }
                },
                {
                    label: '类型',
                    placeholder: '请选择剧本类型',
                    dataIndex: 'types',
                    xType: 'select',
                    store: Dictionary.getOperaTypes,
                    formatKey: {
                        key: 'id',
                        value: 'label'
                    },
                    collapseTags: true,
                    multiple: true,
                    box: 4
                },
                {
                    label: '城市限定',
                    dataIndex: 'is_city_limit',
                    xType: 'checkboxGroup',
                    max: 1,
                    store: [
                        {
                            key: 0,
                            value: '否'
                        },
                        {
                            key: 1,
                            value: '是'
                        }
                    ],
                    box: 4
                }
            ]
        };

        return option;
    }

    private labelComponent(v?: string) {
        v = v ?? '';
        return Vue.extend({
            render(createElement: CreateElement): VNode {
                const labelHash = v!.split(',');
                const children = labelHash.map((v) => {
                    return createElement(
                        'el-tag',
                        {
                            style: {
                                marginRight: '10px',
                                marginBottom: '10px'
                            },
                            props: {
                                size: 'small'
                            }
                        },
                        v
                    );
                });

                return createElement(
                    'div',
                    {
                        style: {
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            marginBottom: '-10px'
                        }
                    },
                    children
                );
            }
        });
    }

    private recommendComponent(v?: string) {
        v = v ?? '';
        return Vue.extend({
            render(createElement: CreateElement): VNode {
                const recommendHash = v!.split(',').sort();
                const tag = (type: string, label: string) =>
                    createElement(
                        'el-tag',
                        {
                            props: {
                                type
                            },
                            style: {
                                marginRight: '10px',
                                marginBottom: '10px'
                            }
                        },
                        label
                    );
                const childHash = recommendHash.map((v) => {
                    switch (+v) {
                        case 2:
                            return tag('success', '店长推荐');
                        case 3:
                            return tag('danger', '热');
                        case 4:
                            return tag('', '新');
                        case 5:
                            return tag('info', '预告');
                        default:
                            return '';
                    }
                });
                return createElement(
                    'div',
                    {
                        style: {
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            marginBottom: '-10px'
                        }
                    },
                    childHash
                );
            }
        });
    }
}
