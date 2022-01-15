<template>
    <div ref="my-echarts" style="width: 100%; height: 100%"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import WorkBenchApi from '@/api/workbench';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption, SeriesOption, TopLevelFormatterParams } from 'echarts/types/dist/shared';
echarts.use([LegendComponent, TitleComponent, TooltipComponent, PieChart, CanvasRenderer]);

@Component
export default class extends Vue {
    private option: EChartsOption = {
        title: {
            text: '剧本类',
            subtext: '剧本数量比例',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            confine: true,
            enterable: true,
            className: 'my-echarts-tooltip',
            formatter(data: TopLevelFormatterParams) {
                if (!(data instanceof Array)) {
                    let str = `<h3 style="margin-bottom:10px; text-align:center;">${data.seriesName}</h3>
                    <p style="margin-bottom:10px;text-align:center;">
                        ${data.marker}
                        ${data.name}: ${data.value}
                    </p>
                    `;

                    let operaStr = '';
                    (
                        data.data as {
                            name: string;
                            value: number;
                            opera_name: string[];
                        }
                    ).opera_name.forEach((v) => {
                        operaStr += `<p style="font-size: 12px; text-align:center; font-weight:400">${v}</p>`;
                    });

                    str += operaStr;

                    const app = new Vue({
                        data() {
                            return {
                                num: 0
                            };
                        },
                        template: `
                        <div>
                            <el-scrollbar class="my-echarts-el-scrollbar" style="overflow-x: hidden">
                               <div>
                                 ${str}
                               </div>
                            </el-scrollbar>
                        </div>`,
                        methods: {
                            handleAdd() {
                                this.num++;
                            }
                        }
                    }).$mount();
                    return app.$el.innerHTML;
                } else {
                    return '';
                }
            }
        },
        legend: {
            orient: 'vertical',
            left: 'right',
            top: 'bottom',
            padding: [100, 20]
        },
        series: [
            {
                name: '剧本类型',
                type: 'pie',
                radius: '80%',
                data: [
                    { value: 1048, name: 'Search Engine' },
                    { value: 735, name: 'Direct' },
                    { value: 580, name: 'Email' },
                    { value: 484, name: 'Union Ads' },
                    { value: 300, name: 'Video Ads' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    private getTypes = ['情感', '硬核', '机制', '恐怖', '欢乐', '推理'];

    public async mounted() {
        const typeCount = await WorkBenchApi.getOperaTypesCount<
            {
                count: number;
                label: string;
                opera_name: string[];
            }[]
        >({
            types: this.getTypes
        });

        (this.option.series as SeriesOption[])[0].data = typeCount.data.map<{
            value: number;
            name: string;
            opera_name: string[];
        }>((v) => {
            return {
                value: v.count,
                name: v.label,
                opera_name: v.opera_name
            };
        });

        const myEcharts = echarts.init(this.$refs['my-echarts'] as HTMLDivElement);

        myEcharts.setOption(this.option);
    }
}
</script>
<style lang="less" scoped>
/deep/ .my-echarts-el-scrollbar {
    width: 200px;

    /deep/ & > .el-scrollbar__wrap {
        max-height: 500px;
    }
}
</style>