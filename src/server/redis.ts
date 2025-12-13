// @ts-ignore
import {createClient, RedisClientType} from 'redis';

export class RedisClient {

    private static client: RedisClientType | null = null;

    static async getClient(): Promise<RedisClientType> {

        const redisURL = process.env.REDIS_URI;

        if (!this.client) {
            this.client = createClient({
                url: redisURL
            });

            this.client.on('error', (err: any) => console.log('Redis Client Error -' + new Date(), err));
            await this.client.connect();
            console.log('CONECTOU NO Redis');

        } else {
            console.log('Redis JÁ CONECTADO');
        }

        return this.client;
    }
}