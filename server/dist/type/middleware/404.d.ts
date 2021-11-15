import { Application } from 'express';
export default class NotFound {
    private static pageUrl;
    static redirect(use: Application['use']): void;
    private static error;
}
