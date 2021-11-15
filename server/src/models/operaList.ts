import Db from '@src/bin/db';
import request from 'request';

enum Params {
    PAGE = 1,
    LIMIT = 1000,
    PARTNERID = '1438023437791657984'
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
request.debug = true;
const db = new Db();

export class Opera {
    private _sql =
        'insert into opera_list (' +
        '`id`,`partner_id`,`goods_init_id`,`name`,`vip_price`,`sale_price`,`category_ids`,`default_category_ids`,`goods_label_ids`,`goods_numbers_id`,`man`,`woman`,`galley`,`galley_people`,`pic_url`,`game_time`,`difficulty`,`detail`,`browser_num`,`sales_num`,`issue_date`,`status`,`heat`,`score`,`sort`,`remark`,`flag`,`create_time`,`update_time`,`recommend`,`recommend_sort`,`history_price`,`goods_qr`,`goods_sort`,`is_top`,`forward_goods_id`,`vip_price_status`,`focus_number`,`focus_status`,`play_number`,`play_status`,`catalogs_names`,`default_catalogs_names`,`is_city_limit`,`is_exclusive`,`is_real`,`number`' +
        ') values(?);';

    private set sql(val: string) {
        this._sql = this._sql.replace('?', val);
    }

    private get sql() {
        return this._sql;
    }

    public async updateOperaList() {
        const res = await this.getOperaList();

        const {
            data: {
                tableDataInfo: { rows }
            }
        } = JSON.parse(res) as OperaList;

        rows.forEach(async (v) => {
            const paramsArr = [];
            for (const i in v) {
                if (Reflect.has(v, i)) {
                    if (typeof v[i] === 'string') {
                        v[i] = `'${v[i]}'`;
                    }

                    if (v[i] === null) {
                        v[i] = `${v[i]}`;
                    }
                    paramsArr.push(v[i]);
                }
            }
            const str = paramsArr.join(',');

            this.sql = str;
            console.log(await db.asyncQuery(this.sql));
        });
    }

    private getOperaList(): Promise<string> {
        return new Promise((resolve, reject) => {
            request.post(
                Url.HOST + Url.LIST,
                {
                    // headers: {
                    //     'User-Agent': 'PostmanRuntime/7.28.4',
                    //     'Postman-Token': '6bd7f084-20cf-4d82-86a1-e507692b1207',
                    //     Accept: '*/*',
                    //     Referer: Url.HOST,
                    //     Host: 'htzj.chinawerewolf.com',
                    //     Cookie: 'SERVERID=bc3a053d04aaf4a5c0283b3a8666fdae|1636018944|1636017109',
                    //     'Content-Type': 'application/x-www-form-urlencoded'
                    // },
                    form: {
                        limit: Params.LIMIT,
                        page: Params.PAGE,
                        partnerId: Params.PARTNERID
                    }
                },
                (err, _res, body) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(body);
                }
            );
        });
    }
}
(async () => {
    await new Opera().updateOperaList();
})();
