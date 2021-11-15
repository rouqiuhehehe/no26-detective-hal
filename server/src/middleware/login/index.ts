import autoBind from '@src/descriptor/autobind';
import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

@autoBind
class LoginMiddware {
    public loginUserCheck(req: Request, res: Response, next: NextFunction) {
        const schema = Joi.object({
            // tslint:disable-next-line:no-magic-numbers
            username: Joi.string().required().min(4).max(20),
            // tslint:disable-next-line:no-magic-numbers
            password: Joi.string().required().min(6).max(16)
        });

        const { error } = schema.validate(req.body);

        if (error) {
            res.error(error.message);
            res.redirect('back');
        } else {
            next();
        }
    }

    public addUserMiddleware(req: Request, res: Response, next: NextFunction) {
        const schema = Joi.object({
            // tslint:disable-next-line:no-magic-numbers
            username: Joi.string().required().min(4).max(20),
            // tslint:disable-next-line:no-magic-numbers
            password: Joi.string().required().min(6).max(16)
        });

        const { error } = schema.validate(req.body);

        if (error) {
            res.error(error.message);
            res.redirect('back');
        } else {
            next();
        }
    }
}

export default new LoginMiddware();
