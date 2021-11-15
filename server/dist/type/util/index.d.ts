/// <reference types="node" />
import HttpError from '@src/models/httpError';
import events from 'events';
import { Request, Response } from 'express';
import fs from 'fs';
import { Status } from '../config/server_config';
import variableTypes from './variable_type';
export declare enum DescriptorKey {
    CLASS = "classDescriptor",
    METHOD = "methodDescriptor"
}
export declare enum DescriptorType {
    DATA = "data",
    ACCESSOR = "accessor",
    UNDEFINED = "undefined"
}
export default class Util {
    static channel: events;
    static variableTypes: typeof variableTypes;
    static hadError<T extends Error>(err: HttpError<T>, res?: Response): void;
    static middlewareDescriptor(target: Object, propertyKey: string | symbol | undefined, descriptor: PropertyDescriptor | undefined, fn: (v: DescriptorKey) => void): void;
    static dateFormat(dft: string | number | Date, format: string): string;
    static getCmdParams(): Record<string, string>;
    static sleep(time: number): Promise<true>;
    static readFile(fileName: string, fn: (data: string | Buffer) => void, encoding?: BufferEncoding): void;
    static getNoParamsUrl(req: Request): string;
    static getFunctionTypeByDescriptor(descriptor: PropertyDescriptor): DescriptorType;
    static getFunctionByDescriptor(descriptor: PropertyDescriptor): {
        type: DescriptorType;
        fn: DescriptorType;
    } | {
        type: DescriptorType.DATA | DescriptorType.ACCESSOR;
        fn: any;
    };
    static dataByReadStream(path: Parameters<typeof fs.createReadStream>[0], option?: Parameters<typeof fs.createReadStream>[1], encoding?: string): Promise<unknown>;
    static successSend(data: unknown): {
        status: Status;
        data: unknown;
        success: boolean;
    };
    static errorSend<T extends Error>(err: T): {
        status: Status;
        success: boolean;
        message: string;
    };
    static isExtendsHttpError<T extends Error>(err: Error): err is HttpError<T>;
}
