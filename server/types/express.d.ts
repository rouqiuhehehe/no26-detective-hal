import { RedisClientType } from '@node-redis/client/dist/lib/client';
import HttpError from '@src/models/httpError';
import { UserInfo } from '@src/types/user';
import express from 'express';
import { SinonAssert } from 'sinon';

declare const modules: {
    json: {
        ARRAPPEND: typeof import('@node-redis/json/dist/commands/ARRAPPEND');
        arrAppend: typeof import('@node-redis/json/dist/commands/ARRAPPEND');
        ARRINDEX: typeof import('@node-redis/json/dist/commands/ARRINDEX');
        arrIndex: typeof import('@node-redis/json/dist/commands/ARRINDEX');
        ARRINSERT: typeof import('@node-redis/json/dist/commands/ARRINSERT');
        arrInsert: typeof import('@node-redis/json/dist/commands/ARRINSERT');
        ARRLEN: typeof import('@node-redis/json/dist/commands/ARRLEN');
        arrLen: typeof import('@node-redis/json/dist/commands/ARRLEN');
        ARRPOP: typeof import('@node-redis/json/dist/commands/ARRPOP');
        arrPop: typeof import('@node-redis/json/dist/commands/ARRPOP');
        ARRTRIM: typeof import('@node-redis/json/dist/commands/ARRTRIM');
        arrTrim: typeof import('@node-redis/json/dist/commands/ARRTRIM');
        DEBUG_MEMORY: typeof import('@node-redis/json/dist/commands/DEBUG_MEMORY');
        debugMemory: typeof import('@node-redis/json/dist/commands/DEBUG_MEMORY');
        DEL: typeof import('@node-redis/json/dist/commands/DEL');
        del: typeof import('@node-redis/json/dist/commands/DEL');
        FORGET: typeof import('@node-redis/json/dist/commands/FORGET');
        forget: typeof import('@node-redis/json/dist/commands/FORGET');
        GET: typeof import('@node-redis/json/dist/commands/GET');
        get: typeof import('@node-redis/json/dist/commands/GET');
        MGET: typeof import('@node-redis/json/dist/commands/MGET');
        mGet: typeof import('@node-redis/json/dist/commands/MGET');
        NUMINCRBY: typeof import('@node-redis/json/dist/commands/NUMINCRBY');
        numIncrBy: typeof import('@node-redis/json/dist/commands/NUMINCRBY');
        NUMMULTBY: typeof import('@node-redis/json/dist/commands/NUMMULTBY');
        numMultBy: typeof import('@node-redis/json/dist/commands/NUMMULTBY');
        OBJKEYS: typeof import('@node-redis/json/dist/commands/OBJKEYS');
        objKeys: typeof import('@node-redis/json/dist/commands/OBJKEYS');
        OBJLEN: typeof import('@node-redis/json/dist/commands/OBJLEN');
        objLen: typeof import('@node-redis/json/dist/commands/OBJLEN');
        RESP: typeof import('@node-redis/json/dist/commands/RESP');
        resp: typeof import('@node-redis/json/dist/commands/RESP');
        SET: typeof import('@node-redis/json/dist/commands/SET');
        set: typeof import('@node-redis/json/dist/commands/SET');
        STRAPPEND: typeof import('@node-redis/json/dist/commands/STRAPPEND');
        strAppend: typeof import('@node-redis/json/dist/commands/STRAPPEND');
        STRLEN: typeof import('@node-redis/json/dist/commands/STRLEN');
        strLen: typeof import('@node-redis/json/dist/commands/STRLEN');
        TYPE: typeof import('@node-redis/json/dist/commands/TYPE');
        type: typeof import('@node-redis/json/dist/commands/TYPE');
    };
    ft: {
        _LIST: typeof import('@node-redis/search/dist/commands/_LIST');
        _list: typeof import('@node-redis/search/dist/commands/_LIST');
        AGGREGATE: typeof import('@node-redis/search/dist/commands/AGGREGATE');
        aggregate: typeof import('@node-redis/search/dist/commands/AGGREGATE');
        ALIASADD: typeof import('@node-redis/search/dist/commands/ALIASADD');
        aliasAdd: typeof import('@node-redis/search/dist/commands/ALIASADD');
        ALIASDEL: typeof import('@node-redis/search/dist/commands/ALIASDEL');
        aliasDel: typeof import('@node-redis/search/dist/commands/ALIASDEL');
        ALIASUPDATE: typeof import('@node-redis/search/dist/commands/ALIASUPDATE');
        aliasUpdate: typeof import('@node-redis/search/dist/commands/ALIASUPDATE');
        CONFIG_GET: typeof import('@node-redis/search/dist/commands/CONFIG_GET');
        configGet: typeof import('@node-redis/search/dist/commands/CONFIG_GET');
        CONFIG_SET: typeof import('@node-redis/search/dist/commands/CONFIG_SET');
        configSet: typeof import('@node-redis/search/dist/commands/CONFIG_SET');
        CREATE: typeof import('@node-redis/search/dist/commands/CREATE');
        create: typeof import('@node-redis/search/dist/commands/CREATE');
        DICTADD: typeof import('@node-redis/search/dist/commands/DICTADD');
        dictAdd: typeof import('@node-redis/search/dist/commands/DICTADD');
        DICTDEL: typeof import('@node-redis/search/dist/commands/DICTDEL');
        dictDel: typeof import('@node-redis/search/dist/commands/DICTDEL');
        DICTDUMP: typeof import('@node-redis/search/dist/commands/DICTDUMP');
        dictDump: typeof import('@node-redis/search/dist/commands/DICTDUMP');
        DROPINDEX: typeof import('@node-redis/search/dist/commands/DROPINDEX');
        dropIndex: typeof import('@node-redis/search/dist/commands/DROPINDEX');
        EXPLAIN: typeof import('@node-redis/search/dist/commands/EXPLAIN');
        explain: typeof import('@node-redis/search/dist/commands/EXPLAIN');
        EXPLAINCLI: typeof import('@node-redis/search/dist/commands/EXPLAINCLI');
        explainCli: typeof import('@node-redis/search/dist/commands/EXPLAINCLI');
        INFO: typeof import('@node-redis/search/dist/commands/INFO');
        info: typeof import('@node-redis/search/dist/commands/INFO');
        SEARCH: typeof import('@node-redis/search/dist/commands/SEARCH');
        search: typeof import('@node-redis/search/dist/commands/SEARCH');
        SPELLCHECK: typeof import('@node-redis/search/dist/commands/SPELLCHECK');
        spellCheck: typeof import('@node-redis/search/dist/commands/SPELLCHECK');
        SUGADD: typeof import('@node-redis/search/dist/commands/SUGADD');
        sugAdd: typeof import('@node-redis/search/dist/commands/SUGADD');
        SUGDEL: typeof import('@node-redis/search/dist/commands/SUGDEL');
        sugDel: typeof import('@node-redis/search/dist/commands/SUGDEL');
        SUGGET_WITHPAYLOADS: typeof import('@node-redis/search/dist/commands/SUGGET_WITHPAYLOADS');
        sugGetWithPayloads: typeof import('@node-redis/search/dist/commands/SUGGET_WITHPAYLOADS');
        SUGGET_WITHSCORES_WITHPAYLOADS: typeof import('@node-redis/search/dist/commands/SUGGET_WITHSCORES_WITHPAYLOADS');
        sugGetWithScoresWithPayloads: typeof import('@node-redis/search/dist/commands/SUGGET_WITHSCORES_WITHPAYLOADS');
        SUGGET_WITHSCORES: typeof import('@node-redis/search/dist/commands/SUGGET_WITHSCORES');
        sugGetWithScores: typeof import('@node-redis/search/dist/commands/SUGGET_WITHSCORES');
        SUGGET: typeof import('@node-redis/search/dist/commands/SUGGET');
        sugGet: typeof import('@node-redis/search/dist/commands/SUGGET');
        SUGLEN: typeof import('@node-redis/search/dist/commands/SUGLEN');
        sugLen: typeof import('@node-redis/search/dist/commands/SUGLEN');
        SYNDUMP: typeof import('@node-redis/search/dist/commands/SYNDUMP');
        synDump: typeof import('@node-redis/search/dist/commands/SYNDUMP');
        SYNUPDATE: typeof import('@node-redis/search/dist/commands/SYNUPDATE');
        synUpdate: typeof import('@node-redis/search/dist/commands/SYNUPDATE');
        TAGVALS: typeof import('@node-redis/search/dist/commands/TAGVALS');
        tagVals: typeof import('@node-redis/search/dist/commands/TAGVALS');
    };
};
declare global {
    type ExpressResPonse = express.Response;
    type ExpressRequest = express.Request;
    type NextFunction = express.NextFunction;
    type Client = RedisClientType<typeof modules, Record<string, never>>;

    /**
     * 并集
     */
    type Intersection<T extends object, U extends object> = Pick<
        T,
        // 取出T中属于U的字段，和U中属于T的字段，取并集
        Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
    >;

    /**
     * 差集
     */
    type Diff<T extends object, U extends object> = Pick<
        T,
        // 取出T中不属于U的字段
        Exclude<keyof T, keyof U>
    >;

    /**
     * 将交叉类型合并
     */
    type Compute<T extends object> = T extends Function ? T : { [K in keyof T]: T[K] };
    /**
     * 合并接口
     */
    type Merge<T extends object, U extends object> = Compute<
        // 排除掉U中属于T的字段，和T组成交叉类型，然后合并成新接口
        T & Omit<U, keyof T>
    >;

    /**
     * 重写, U重写T
     */
    // 取出T,U的差集，再取出T,U的并集，联合成新接口
    type Overwrite<T extends object, U extends object, I = Diff<T, U> & Intersection<U, T>> = Pick<I, keyof I>;

    namespace Express {
        type Message = (message: string, type?: string) => void;
        interface Response {
            message: Message;
            error<T extends Error>(e: HttpError<T>, data?: Record<string, string | number>): void;
            success<T extends Record<string, any>>(data?: T): void;
        }

        interface Request {
            user: UserInfo;
            token?: string;
        }
    }

    namespace Chai {
        interface Assertion extends SinonAssert {
            abc: string;
        }
    }
}
export {};
