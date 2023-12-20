// default imports
import Redis from 'ioredis';

// named imports
import { config } from 'dotenv';
import { Channel } from '../common';

config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisService {
  private _pub: Redis;
  private _sub: Redis;

  constructor() {
    this._pub = new Redis(REDIS_URL);
    this._sub = new Redis(REDIS_URL);
  }

  get pub(): Redis {
    return this._pub;
  }

  get sub(): Redis {
    return this._sub;
  }

  public async publish(channel: Channel, message: string): Promise<void> {
    await this.pub.publish(channel, message);
  }
}

export default RedisService;
