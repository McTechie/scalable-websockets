// default imports
import http from 'http';
import SocketService from './services/socket';
import KafkaService from './services/kafka';

// named imports
import { config } from 'dotenv';
import { Logger } from './logger';
import { Topic } from './common';

// environment variables
config();

const kafka = KafkaService.getInstance();
const logger = new Logger();

async function init() {
  kafka.consumeMessages(Topic.MESSAGES);
  
  // create a new instance of SocketService
  const socketService = new SocketService();
  
  // attach the socket.io server to the http server
  const server = http.createServer();
  socketService.io.attach(server);
  
  // start the http server
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => logger.success(`⚡️ Web Sockets Server started on port: ${PORT}`));

  // initialize the socket.io listeners
  socketService.initListeners();
}

init();
