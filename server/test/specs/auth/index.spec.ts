import base from '../../model/base';

class TestAuthRoutes extends base {
    public constructor() {
        super();

        this.loginTest();
    }

    private loginTest() {
        describe('@Get /auth/management-system', () => {
            it('是否可以正常返回token', async () => {
                const token = await this.login();

                this.expect(token).to.be.a('string');
            });
        });
    }
}
new TestAuthRoutes();
