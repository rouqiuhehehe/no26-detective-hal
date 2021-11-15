import { Status } from '@src/config/server_config';

export default class HttpError<T extends Error> extends Error {
    public success = false;

    public constructor(public status = Status.SERVER_ERROR, public message = 'unkonw error', public err?: T) {
        super(message);
    }
}
