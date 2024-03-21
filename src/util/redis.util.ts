import {Logger} from "@nestjs/common";
import Redis from 'ioredis';


class RedisUtil {
    private readonly logger = new Logger(RedisUtil.name);
    private config
    private client;
    private bullClient;
    private bullSubscriber;

    getRedisClient() {
        return this.client
    }
    getBullRedisClient() {
        return this.bullClient
    }
    getBullRedisSubscriber() {
        return this.bullSubscriber
    }
    getRedisConfig() {
        return this.config
    }

    init() {
        //set default max listeners for event emitter
        const events = require('events')
        events.setMaxListeners(100)

        this.config = {
            host: process.env.LEAD_PROCESS_REDIS_HOST || 'redis',
            port: process.env.LEAD_PROCESS_REDIS_PORT || 6379,
        }
        const redisPassword = process.env.LEAD_PROCESS_REDIS_PASSWORD;

        if (redisPassword && redisPassword !== '') {
            Object.assign(this.config, { password: redisPassword })
        }

        if ((process.env.LEAD_PROCESS_REDIS_TLS || 'true') == 'true') {
            Object.assign(this.config, {
                tls: {
                    servername: this.config.host,
                    rejectUnauthorized: false
                }
            })
        }

        this.client = new Redis(this.config);
        this.bullClient = new Redis({...this.config});
        this.bullSubscriber = new Redis({...this.config});
    }
}

export default new RedisUtil