"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Message {
    static messageMiddleware(req, res, next) {
        res.message = Message.getMessage(req);
        res.error = (msg) => res.message(msg, 'error');
        res.locals.messages = req.session.messages ?? [];
        res.locals.removeMessages = () => {
            req.session.messages = [];
        };
        next();
    }
    static getMessage(req) {
        return (message, type = 'info') => {
            req.session.messages = req.session.messages ?? [];
            req.session.messages.push({
                message,
                type
            });
        };
    }
}
exports.default = Message;
//# sourceMappingURL=message.js.map