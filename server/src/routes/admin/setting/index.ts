import Db from '@src/bin/Db';
import redis from '@src/bin/redis';
import { Permission } from '@src/config/permission';
import { Status } from '@src/config/server_config';
import { Controller, Get, Post } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import Validate from '@src/descriptor/validate';
import HttpError from '@src/models/httpError';
import User from '@src/models/user';
import Util from '@util';
import Joi from 'joi';
import admin from '..';
import { Opera } from '@src/models/operaList';

const db = new Db();
const user = new User();
@Controller('/setting')
export default class extends admin {
    @Middleware()
    @Get('/get-setting-user-info')
    public async getSettingUserInfo(req: ExpressRequest, res: ExpressResPonse) {
        const userInfo = await user.getUserInfoByToken(req);
        const { uid, username, nickname, avatar, permission, create_date, update_date } = userInfo;
        let permissionLabel = '';
        if ((permission & Permission.READ_AND_WRITE) === Permission.READ_AND_WRITE) {
            permissionLabel = '可读可写';
        } else if ((permission & Permission.READ) === Permission.READ) {
            permissionLabel = '只读';
        } else if ((permission & Permission.HIDDEN) === Permission.HIDDEN) {
            permissionLabel = '没有权限';
        }
        res.success({
            uid,
            username,
            nickname,
            avatar,
            permission: permissionLabel,
            create_date,
            update_date
        });
    }

    @Middleware()
    @Get('/get-setting-user-info/view')
    public async getSettingUserInfoView(req: ExpressRequest, res: ExpressResPonse) {
        const userInfo = await user.getUserInfoByToken(req);
        const { uid, username, nickname, avatar } = userInfo;
        res.success({
            uid,
            username,
            nickname,
            avatar
        });
    }

    @Validate({
        nickname: Joi.string().min(4).max(8).required(),
        username: Joi.string().min(4).max(8).required(),
        avatar: Joi.string()
            .regex(/^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/)
            .message('请填写正确的头像地址')
            .required()
    })
    @Middleware()
    @Post('/get-setting-user-info/update')
    public async updateSettingUserInfo(req: ExpressRequest, res: ExpressResPonse, next: NextFunction) {
        const { nickname, username, avatar } = req.body;
        const userInfo = await user.getUserInfoByToken(req);
        const { uid } = userInfo;
        const params = {
            nickname,
            username,
            avatar: Util.getNoHostUrl(avatar),
            update_date: Util.dateFormat(Date.now(), 'yyyy-MM-dd HH:mm:ss')
        };

        const sql = this.updateSettingUserInfoSql(params, uid);
        try {
            await db.beginTransaction(sql);
            await redis(async (client) => {
                const userInfo = await user.getUserInfoByToken(req);
                params.avatar = avatar;
                for (const i in params) {
                    if (Reflect.has(userInfo, i) && Reflect.has(params, i)) {
                        userInfo[i] = params[i];
                    }
                }
                // @ts-ignore
                await client.hSet('user:' + req.token, userInfo);
            });

            res.success();
        } catch (error: any) {
            next(new HttpError(Status.SERVER_ERROR, error.message, error));
        }
    }

    @Middleware()
    @Post('/get-setting-user-info/update-opera-list')
    public async updateOperaList(_req: ExpressRequest, res: ExpressResPonse, next: NextFunction) {
        const opera = new Opera();

        try {
            await opera.updateOperaList();
            res.success({
                value: true
            });
        } catch (e) {
            if (Util.isExtendsHttpError(e)) {
                next(e);
            } else {
                next(new HttpError(Status.SERVER_ERROR, (e as any).message));
            }
        }
    }

    private updateSettingUserInfoSql(
        params: {
            nickname: string;
            username: string;
            avatar: string;
            update_date: string;
        },
        uid: string
    ) {
        const sqlarr = [];
        for (const key in params) {
            if (Reflect.has(params, key)) {
                sqlarr.push(`${key}='${params[key]}'`);
            }
        }

        const sql = sqlarr.join();
        return `update user set ${sql} where uid = '${uid}'`;
    }
}