"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NotFound {
    static pageUrl = ['/page', '/ejs/*/view'];
    static redirect(use) {
        NotFound.pageUrl.forEach((v) => {
            use(v, NotFound.error);
        });
    }
    static error(_req, res, _next) {
        return res.redirect('/404');
    }
}
exports.default = NotFound;
//# sourceMappingURL=404.js.map