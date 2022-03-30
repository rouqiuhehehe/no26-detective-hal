import Api from '@src/routes/api';
import Handler from '@src/routes/api/test/Handler';
import { Controller, SuperRoutes, SuperRoutesValidator, TurnOffParamsValidate } from '@src/descriptor/controller';
import validation from '@src/routes/api/test/validation';

const handler = new Handler();
@SuperRoutesValidator(validation)
@TurnOffParamsValidate
@SuperRoutes
@Controller('/test')
export default class Test extends Api<Handler> {
    protected get handler() {
        return handler;
    }
}
