import { RedisConfig } from '@src/config/redis_config';
import redis from 'redis';

export default redis.createClient(RedisConfig.POIT, '127.0.0.1');
