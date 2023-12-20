// default imports
import http from 'http';
import SocketService from './services/socket';

// named imports
import { config } from 'dotenv';
import { Logger } from './logger';

// environment variables
config();

// create a new instance of Logger
const logger = new Logger();

async function init() {
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
