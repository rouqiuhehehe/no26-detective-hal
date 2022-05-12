// noinspection ES6PreferShortImport

import { redisPushReplay } from '../../../src/descriptor/middleware/anti-replay';
import { authorizationMiddleware } from '../../../src/descriptor/middleware/authorization';
import base from '../../model/base';

class TestMiddleWare extends base {
    public constructor() {
        super();

        this._rTest();
        this.signTest();
    }

    private _rTest() {
        const sign = this._r(1);
        describe('测试_r防重放参数', () => {
            it('_r不重复，调用next', () => {
                const next = () => {
                    console.log(nextObserver.firstCall.args);
                    this.expect(nextObserver.firstCall).to.be.a('object');
                    this.expect(nextObserver.firstCall.firstArg).to.be.undefined;
                };

                const request = this.mocksHttp.createRequest({
                    query: {
                        _r: sign
                    }
                });
                const response = this.mocksHttp.createResponse();

                const nextObserver = this.sinon.spy(next);

                redisPushReplay(request, response, nextObserver);
            });

            it('_r重复会调用next，参数为error', () => {
                const next = () => {
                    console.log(nextObserver.firstCall.args);
                    this.expect(nextObserver.firstCall).to.be.a('object');
                    this.expect(nextObserver.firstCall.firstArg).to.be.a('error');
                };

                const request = this.mocksHttp.createRequest({
                    query: {
                        _r: sign
                    }
                });
                const response = this.mocksHttp.createResponse();

                const nextObserver = this.sinon.spy(next);

                redisPushReplay(request, response, nextObserver);
            });
        });
    }

    private signTest() {
        describe('sign签名测试', () => {
            it('加解密参数成功，调用next', () => {
                const obj = {
                    _r: this._r(1),
                    timestamp: Date.now(),
                    name: 'yoshiki'
                };

                const sign = this.encodedDataByPublicKey(obj);

                const next = () => {
                    console.log(nextObserver.firstCall.args);
                    this.expect(nextObserver.firstCall).to.be.a('object');
                    this.expect(nextObserver.firstCall.firstArg).to.be.undefined;
                };

                const request = this.mocksHttp.createRequest({
                    query: {
                        ...obj,
                        sign
                    }
                });
                const response = this.mocksHttp.createResponse();

                const nextObserver = this.sinon.spy(next);

                authorizationMiddleware(request, response, nextObserver);
            });

            it('加解密参数失败，参数被篡改，调用next抛出异常', () => {
                const obj = {
                    _r: this._r(1),
                    timestamp: Date.now(),
                    name: 'yoshiki'
                };

                const sign = this.encodedDataByPublicKey(obj);

                const next = () => {
                    console.log(nextObserver.firstCall.args);
                    this.expect(nextObserver.firstCall).to.be.a('object');
                    this.expect(nextObserver.firstCall.firstArg).to.be.a('error');
                };

                const request = this.mocksHttp.createRequest({
                    query: {
                        ...obj,
                        sign,
                        // 重新赋值timestamp，修改参数
                        timestamp: Date.now() + 100
                    }
                });
                const response = this.mocksHttp.createResponse();

                const nextObserver = this.sinon.spy(next);

                authorizationMiddleware(request, response, nextObserver);
            });
        });
    }
}
new TestMiddleWare();
