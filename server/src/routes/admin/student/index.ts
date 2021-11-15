import autoBind from '@src/descriptor/autobind';
import { Controller, Get, Post } from '@src/descriptor/controller';
import Required from '@src/descriptor/required';
import Validate from '@src/descriptor/validate';
import Util from '@util';
import { Request, Response } from 'express';
import Joi from 'joi';
import admin from '..';

@Controller('/student')
export default class extends admin {
    @autoBind
    @Validate({
        name: Joi.string().required()
    })
    @Get('/')
    public indexPage(_req: Request, res: Response) {
        res.send(`<h1>${this.homePageRender()}</h1>`);
    }

    @Required(['name', '+age'])
    @Get('/dsc')
    public testPage(req: Request, res: Response) {
        const { name, age } = req.query;
        res.send(`
            <h1>
                name: <span style="color: #09c">${name}</span>
            </h1>
            <br/>
            <h1>
                age: <span style="color: #09c">${age}</span>
            </h1>
        `);
    }

    @Validate({
        // tslint:disable-next-line: no-magic-numbers
        class: Joi.number().min(1).max(99).required()
    })
    @Post('/class')
    public getClassInfo(req: Request, res: Response) {
        res.send(Util.successSend(req.body.class));
    }

    private homePageRender() {
        return 'this is student homepage, welcome!';
    }
}
