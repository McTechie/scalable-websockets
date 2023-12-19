// default imports
import http from 'http';
import SocketService from './services/socket';

// named imports
import { Logger } from './logger';

const logger = new Logger();

const PORT = process.env.PORT || 8000;

async function init() {
  // create a new instance of SocketService
  const socketService = new SocketService();

  // attach the socket.io server to the http server
  const server = http.createServer();
  socketService.io.attach(server);

  // start the http server
  server.listen(PORT, () => logger.success(`Web Sockets Server started on port: ${PORT}`));

  // initialize the socket.io listeners
  socketService.initListeners();
}

init();
