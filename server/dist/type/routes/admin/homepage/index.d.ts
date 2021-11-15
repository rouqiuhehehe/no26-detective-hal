import { Request, Response } from 'express';
import admin from '..';
export default class extends admin {
    indexPage(_req: Request, res: Response): void;
    private homePageRender;
}
