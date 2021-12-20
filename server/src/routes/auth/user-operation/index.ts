import { Controller } from '@src/descriptor/controller';
import Auth from '..';

@Controller('/user-operation')
export default class UserOperation extends Auth {}
