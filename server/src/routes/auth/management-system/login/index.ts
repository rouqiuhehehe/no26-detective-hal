// import { Get } from '@src/descriptor/controller';
// import Required from '@src/descriptor/required';
// import User from '@src/models/user';
// import ManagementSystem from '..';

// const user = new User();
// export default class Login extends ManagementSystem {
//     @Required(['username', 'password'])
//     @Get('/login')
//     public async login(req: ExpressRequest, res: ExpressResPonse) {
//         this.loginHandle(req, res);
//     }

//     private async loginHandle(req: ExpressRequest, res: ExpressResPonse, isForcedLogin?: boolean) {
//         const { username, password } = req.body;
//         try {
//             req.session.uid = await user.authenticate({
//                 username,
//                 password
//             });

//             req.session.authorization = 'Bearer ' + (await user.issueToken(req.session.uid));

//             if (process.env.NODE_ENV === 'development') {
//                 res.cookie('authorization', req.session.authorization, {
//                     // tslint:disable-next-line: no-magic-numbers
//                     maxAge: 1000 * 60 * 60 * 4,
//                     signed: true,
//                     httpOnly: true
//                 });
//                 res.cookie('uid', req.session.uid, {
//                     // tslint:disable-next-line: no-magic-numbers
//                     maxAge: 1000 * 60 * 60 * 4,
//                     signed: true,
//                     httpOnly: true
//                 });
//             }
//             res.redirect(`/ejs/entries?title=${username}&name=${username}`);
//         } catch (e: any) {
//             res.error(e.message ?? e);
//             res.redirect('back');
//         }
//     }
// }
