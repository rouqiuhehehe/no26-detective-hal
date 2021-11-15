import express from 'express';
export default class App {
    app: express.Application;
    constructor();
    initRoute(cb?: (err?: Error) => void): Promise<unknown>;
    private middleware;
    private errorMiddleWare;
    private set;
    private config;
    private listen;
}
