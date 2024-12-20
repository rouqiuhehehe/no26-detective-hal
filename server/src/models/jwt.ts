import { Jwt_Config } from '@src/config/jwt';
import * as Jsonwebtoken from 'jsonwebtoken';
export class Jwt {
    public static issueToken(username: string, uid: string, secret: string) {
        return Jsonwebtoken.sign(
            {
                data: username,
                uid
            },
            secret,
            {
                expiresIn: Jwt_Config.JWT_EXPIRED
            }
        );
    }

    public static vailToken(token: string, secret: string): Promise<Jsonwebtoken.JwtPayload> {
        return new Promise((resolve, reject) => {
            return Jsonwebtoken.verify(token, secret, (err, decoded) => {
                if (err) {
                    // TokenExpiredError token到期
                    // JsonWebTokenError 报错，无效token
                    reject(err);
                } else {
                    resolve(decoded as Jsonwebtoken.JwtPayload);
                }
            });
        });
    }
}
