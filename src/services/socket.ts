// default imports
import Redis from 'ioredis';

// named imports
import { Server } from 'socket.io';
import { Logger } from '../logger';

const logger = new Logger();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const pub = new Redis(REDIS_URL);
const sub = new Redis(REDIS_URL);

enum Event {
  CONNECTION = 'connection',
  MESSAGE = 'event:message',
  DISCONNECT = 'disconnect',
}

enum Channel {
  MESSAGES = 'MESSAGES',
}

class SocketService {
  private _io: Server;

  // initialize the socket.io server
  constructor() {
    logger.success('Socket Service initialized');
    this._io = new Server({
      cors: {
        origin: '*',
      },
    });
    
    // subscribe to the MESSAGES channel
    sub.subscribe('MESSAGES');
  }

  // getter method to return the socket.io server
  get io(): Server {
    return this._io;
  }

  // method to emit messages to a channel
  private publish(channel: string, message: string): void {
    pub.publish(channel, JSON.stringify({ message }));
  }

  // method to initialize socket.io listeners
  public initListeners(): void {
    const io = this.io;
    
    io.on(Event.CONNECTION, (socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      // emit the message to the REDIS channel
      socket.on(Event.MESSAGE, (message: string) => {
        logger.info(`Message received: ${message}`);
        this.publish(Channel.MESSAGES, message);
      });

      // relay the message to the clients
      sub.on('message', (channel, message) => {
        if (channel === Channel.MESSAGES) {
          logger.info(`Message sent: ${message}`);
          io.emit('message', message);
        }
      });
      
      socket.on(Event.DISCONNECT, () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }
}

export default SocketService;
