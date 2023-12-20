// default imports
import Redis from 'ioredis';

// named imports
import { Server } from 'socket.io';
import { Logger } from '../logger';
import { db } from '../db/client';
import { messages } from '../db/schema';

const logger = new Logger();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const pub = new Redis(REDIS_URL);
const sub = new Redis(REDIS_URL);

enum Event {
  CONNECTION = 'connection',
  MESSAGE = 'event:message',
  LISTEN = 'event:listen',
  DISCONNECT = 'disconnect',
}

enum Channel {
  MESSAGES = 'MESSAGES',
}

class SocketService {
  private _io: Server;

  // initialize the socket.io server
  constructor() {
    this._io = new Server({
      cors: {
        origin: '*',
      },
    });
    
    // subscribe to the MESSAGES channel
    sub.subscribe(Channel.MESSAGES);
    logger.success('🔌 Socket Service initialized');
  }

  // getter method to return the socket.io server
  get io(): Server {
    return this._io;
  }

  // method to emit messages to a channel
  private publish(channel: Channel, message: string): void {
    pub.publish(channel, JSON.stringify({ message }));
  }

  // method to initialize socket.io listeners
  public initListeners(): void {
    const io = this.io;
    
    io.on(Event.CONNECTION, (socket) => {
      logger.info(`[Socket] Connection Established: ${socket.id}`);

      // emit the message to the REDIS channel
      socket.on(Event.MESSAGE, (message: string) => {
        logger.info(`[Redis] Publishing: ${message}`);
        this.publish(Channel.MESSAGES, message);
        logger.info(`[Redis] Published!`);
      });

      // relay the message to the clients
      sub.on('message', async (channel, message) => {
        if (channel === Channel.MESSAGES) {
          logger.info(`[Redis] Consuming: ${message}`);
          io.emit(Event.LISTEN, message);
          logger.info(`[Redis] Consumed!`);
          
          logger.info(`[DB] Inserting: ${message}`);
          await db.insert(messages).values({ text: message });
          logger.info(`[DB] Inserted!`);
        }
      });
      
      socket.on(Event.DISCONNECT, () => {
        logger.info(`[Socket] Disconnected: ${socket.id}`);
      });
    });
  }
}

export default SocketService;
