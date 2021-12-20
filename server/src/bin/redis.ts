import { RedisConfig } from '@src/config/redis_config';
import { createClient } from 'redis';

export default async function redis(cb: (connect: Client, quit: () => Promise<void>) => void) {
    const client = createClient({
        socket: {
            port: RedisConfig.POIT as number,
            host: RedisConfig.HOST as string
        }
    });

    client.on('error', (err) => {
        console.log('Redis Client Error', err);
    });
    let isQuit = false;
    const quit = async () => {
        isQuit = true;
        await client.quit();
    };
    try {
        await client.connect();
        await cb(client, quit);
    } catch (error: any) {
        throw error;
    } finally {
        if (!isQuit) {
            await quit();
        }
    }
}
