export class Logger {
  info(message: string) {
    console.log('\x1b[36m%s\x1b[0m', `[${new Date().toISOString()}] | ${message}`);
  }

  error(message: string) {
    console.log('\x1b[31m%s\x1b[0m', `[${new Date().toISOString()}] | ${message}`);
  }

  success(message: string) {
    console.log('\x1b[32m%s\x1b[0m', message);
  }
}
