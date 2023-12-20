// default imports
import RedisService from './redis';
import KafkaService from './kafka';

// named imports
import { Server } from 'socket.io';
import { Logger } from '../logger';
import { Channel, Event, Topic } from '../common';

const logger = new Logger();
const redis = new RedisService();
const kafka = KafkaService.getInstance();

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
    redis.sub.subscribe(Channel.MESSAGES);
    logger.success('🔌 Socket Service initialized');
  }

  // getter method to return the socket.io server
  get io(): Server {
    return this._io;
  }

  // method to initialize socket.io listeners
  public initListeners(): void {
    const io = this.io;
    
    io.on(Event.CONNECTION, (socket) => {
      logger.info(`[Socket] Connection Established: ${socket.id}`);

      // emit the message to the REDIS channel
      socket.on(Event.MESSAGE, (message: string) => {
        logger.info(`[Redis] Publishing: ${message}`);
        redis.publish(Channel.MESSAGES, message);
        logger.info(`[Redis] Published!`);
      });

      // relay the message to the clients
      redis.sub.on('message', async (channel, message) => {
        if (channel === Channel.MESSAGES) {
          logger.info(`[Redis] Consuming: ${message}`);
          io.emit(Event.LISTEN, message);
          logger.info(`[Redis] Consumed!`);

          logger.info(`[Kafka] Producing: ${message}`);
          await kafka.produceMessage(Topic.MESSAGES, message);
          logger.info(`[Kafka] Produced!`);
        }
      });
      
      socket.on(Event.DISCONNECT, () => {
        logger.info(`[Socket] Disconnected: ${socket.id}`);
      });
    });
  }
}

export default SocketService;
