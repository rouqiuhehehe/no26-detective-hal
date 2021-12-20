import { Controller } from '@src/descriptor/controller';
import Log from '@src/descriptor/middleware/log';

@Log()
@Controller('/admin', true)
export default class {}
