import { Status } from '@src/config/server_config';
export default class HttpError<T extends Error> extends Error {
    status: Status;
    message: string;
    err?: T | undefined;
    success: boolean;
    constructor(status?: Status, message?: string, err?: T | undefined);
}
