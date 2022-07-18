import Db from '@src/bin/Db';
import redis from '@src/bin/redis';
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
import regExp from '@src/util/regExp';

const db = new Db();
const user = new User();
@Controller('/setting')
export default class extends admin {
    @Middleware()
    @Get('/get-setting-user-info')
    public async getSettingUserInfo(req: ExpressRequest, res: ExpressResponse) {
        const userInfo = await user.getUserInfoByToken(req.user.token);
        const { uid, username, nickname, avatar, permission, create_time, update_time, phone, role, roleValue } =
            userInfo;
        let fullPhone = phone;
        if (fullPhone) {
            const sql = `SELECT n_mask_label FROM n_phone_mask_relation WHERE n_id = ?`;
            const [{ n_mask_label: maskLabel }] = await db.asyncQuery(sql, uid);
            fullPhone = fullPhone.replace(/^(\d{3})\*{4}(\d{4})/, `$1${maskLabel}$2`);
        }
        res.success({
            uid,
            username,
            nickname,
            role: role?.split(','),
            roleValue: roleValue?.split(','),
            phone: fullPhone,
            avatar,
            create_time,
            update_time
        });
    }

    @Middleware()
    @Get('/get-setting-user-info/view')
    public async getSettingUserInfoView(req: ExpressRequest, res: ExpressResponse) {
        const userInfo = await user.getUserInfoByToken(req.user.token);
        const { uid, username, nickname, avatar } = userInfo;
        res.success({
            uid,
            username,
            nickname,
            avatar
        });
    }

    @Validate({
        nickname: Joi.string()
            .min(4)
            .max(8)
            .regex(regExp.specialSymbolsRegExp(), {
                invert: true
            })
            .required()
            .error((err) =>
                Util.joiErrorMessage(err, {
                    min: '昵称不能少于4个字符',
                    max: '昵称不能大于8个字符',
                    required: '请输入昵称',
                    regx: '昵称不能带有特殊符号'
                })
            ),
        username: Joi.string().min(4).max(8).message('请输入用户名').required(),
        avatar: Joi.string()
            .required()
            .regex(/^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/)
            .error((err) => {
                let message;
                err.forEach((v) => {
                    switch (v.code) {
                        case 'any.required':
                            message = '请输入头像';
                            break;
                        case 'string.pattern.base':
                            message = '请输入正确的头像地址';
                            break;
                        default:
                            message = '请输入正确的头像地址';
                    }
                });
                return new Error(message);
            })
    })
    @Middleware()
    @Post('/get-setting-user-info/update')
    public async updateSettingUserInfo(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        const { nickname, username, avatar } = req.body;
        const userInfo = await user.getUserInfoByToken(req.user.token);
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
                const userInfo = await user.getUserInfoByToken(req.user.token);
                params.avatar = avatar;
                for (const i in params) {
                    if (Reflect.has(userInfo, i) && Reflect.has(params, i)) {
                        userInfo[i] = params[i];
                    }
                }
                // @ts-ignore
                await client.hSet(`user:${req.user.token}`, userInfo);
            });

            res.success();
        } catch (error: any) {
            next(new HttpError(Status.SERVER_ERROR, error.message, error));
        }
    }

    @Middleware()
    @Post('/get-setting-user-info/update-opera-list')
    public async updateOperaList(_req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
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
