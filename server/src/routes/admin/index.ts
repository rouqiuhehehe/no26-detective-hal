import autoBind from '@src/descriptor/autobind';
import { Controller } from '@src/descriptor/controller';
import Log from '@src/descriptor/log';

@autoBind
@Log()
@Controller('/admin', true)
export default class {}
