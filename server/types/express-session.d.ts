declare module 'express-session' {
    interface Success {
        message: string;
    }
    interface SessionMessages {
        type: string;
        message: string;
    }
    export interface SessionData {
        messages: SessionMessages[];
        locals: Record<string, any>;
        uid: string;
        authorization: string;
        success: Success;
        salt: string;
    }
}

export {};
