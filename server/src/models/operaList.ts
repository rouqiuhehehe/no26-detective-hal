import Db from '@src/bin/Db';
import { OperaTypes } from '@src/types/dictionary';
import axios from 'axios';
import Dictionary from './dictionary';

enum Params {
    PAGE = 1,
    LIMIT = 1000,
    PARTNERED = '1438023437791657984'
}

enum Url {
    HOST = 'https://htzj.chinawerewolf.com/store-api/commonIndex',
    LIST = '/getGoodsList'
}

interface OperaList {
    code: number;
    msg: string;
    data: {
        isReal: number;
        vipLevelSwitch: number;
        tableDataInfo: {
            total: number;
            rows: Record<string, any>[];
        };
    };
}
const db = new Db();
const dictionary = new Dictionary();
const truncateSql = 'truncate opera_list';
const updateAutoIncrementSql = 'analyze table opera_list';
const sql =
    'insert into opera_list (' +
    '`id`,`partner_id`,`goods_init_id`,`name`,`vip_price`,`sale_price`,`category_ids`,`default_category_ids`,`goods_label_ids`,`goods_numbers_id`,`man`,`woman`,`galley`,`galley_people`,`pic_url`,`game_time`,`difficulty`,`detail`,`browser_num`,`sales_num`,`issue_date`,`status`,`heat`,`score`,`sort`,`remark`,`flag`,`create_time`,`update_time`,`recommend`,`recommend_sort`,`history_price`,`goods_qr`,`goods_sort`,`is_top`,`forward_goods_id`,`vip_price_status`,`focus_number`,`focus_status`, `comment_status`, `play_number`,`play_status`,`catalogs_names`,`default_catalogs_names`,`is_city_limit`,`is_exclusive`,`is_real`,`number`,`goods_avg_score`, `total_play_num`, `rank`, `editor_name`, `editor_content`, `goods_comment_number`, `issue_dates`, `types`' +
    ') values(?);';

export class Opera {
    private _sql = sql;

    private columns = [
        'id',
        'partnerId',
        'goodsInitId',
        'name',
        'vipPrice',
        'salePrice',
        'categoryIds',
        'defaultCategoryIds',
        'goodsLabelIds',
        'goodsNumbersId',
        'man',
        'woman',
        'galley',
        'galleyPeople',
        'picUrl',
        'gameTime',
        'difficulty',
        'detail',
        'browserNum',
        'salesNum',
        'issueDate',
        'status',
        'heat',
        'score',
        'sort',
        'remark',
        'flag',
        'createTime',
        'updateTime',
        'recommend',
        'recommendSort',
        'historyPrice',
        'goodsQr',
        'goodsSort',
        'isTop',
        'forwardGoodsId',
        'vipPriceStatus',
        'focusNumber',
        'focusStatus',
        'commentStatus',
        'playNumber',
        'playStatus',
        'catalogsNames',
        'defaultCatalogsNames',
        'isCityLimit',
        'isExclusive',
        'isReal',
        'number',
        'goodsAvgScore',
        'totalPlayNum',
        'rank',
        'editorName',
        'editorContent',
        'goodsCommentNumber',
        'issueDates'
    ];

    private set sql(val: string) {
        this._sql = sql.replace('?', val);
    }

    private get sql() {
        return this._sql;
    }

    public async updateOperaList() {
        const { data } = await this.getOperaList();
        const types = await dictionary.getOperaTypes();

        const typesMap = this.createTypesMap(types);

        const {
            data: {
                tableDataInfo: { rows }
            }
        } = data;

        const sqlArr = rows.map((v) => {
            const paramsArr = [];
            const types: number[] = [];

            for (const i in v) {
                if (Reflect.has(v, i) && this.columns.includes(i)) {
                    if (typeof v[i] === 'string') {
                        v[i] = `'${v[i]}'`;
                    }

                    if (v[i] === null) {
                        v[i] = `${v[i]}`;
                    }
                    if (i === 'defaultCatalogsNames') {
                        const typesArr = (v[i] as string).replace(/'/g, '').split(',');

                        typesArr.forEach((type) => {
                            if (typesMap.has(type)) {
                                types.push(typesMap.get(type)!);
                            }
                        });
                    }
                    paramsArr.push(v[i]);
                }
            }

            paramsArr.push(`'${types.toString()}'`);
            this.sql = paramsArr.join(',');
            return this.sql;
        });
        sqlArr.unshift(truncateSql);
        sqlArr.push(updateAutoIncrementSql);

        await db.databaseBackup();
        await db.beginTransaction(sqlArr);
    }

    // noinspection JSMethodCanBeStatic
    private getOperaList() {
        return axios.post<OperaList>(Url.HOST + Url.LIST, undefined, {
            params: {
                limit: Params.LIMIT,
                page: Params.PAGE,
                partnerId: Params.PARTNERED
            }
        });
    }

    private createTypesMap(types: OperaTypes[]) {
        const map = new Map<string, number>();

        types.forEach((v) => {
            map.set(v.label, v.id);
        });

        return map;
    }
}
