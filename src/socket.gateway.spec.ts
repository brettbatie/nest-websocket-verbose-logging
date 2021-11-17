import { Test, TestingModule } from '@nestjs/testing';
import { SocketGateway } from './socket.gateway';
import { IoAdapter } from '@nestjs/platform-socket.io';
import {
  ConsoleLogger,
  INestApplication,
  ServiceUnavailableException,
} from '@nestjs/common';
import { connect } from 'socket.io-client';

describe('SocketGateway', () => {
  let gateway: SocketGateway;
  let app: INestApplication;
  let log: TestLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketGateway],
    }).compile();

    app = module.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    log = new TestLogger();
    app.useLogger(log);
    await app.init();
  });

  it('subscribe message caught when there are multiple messages logged where one has "subscribe" message', () => {
    log.log('Subscribe SocketGateway. method to message message.');
    log.log('something else ');
    expect(log.didLogSubscribeMessage).toEqual(true);
  });

  it('subscribe message not caught when multiple message without "subscribe" in it', () => {
    log.log('another phrase');
    log.log('something else');
    expect(log.didLogSubscribeMessage).toEqual(false);
  });

  it('should not log on each socket connection', (done) => {
    const address = app.getHttpServer().listen().address();
    const socket = connect(`http://[${address.address}]:${address.port}`, {
      path: '/socket.io/message',
    });
    socket.on('connect_error', (e) => {
      throw new ServiceUnavailableException(
        e,
        'Failed to connect to websocket',
      );
    });
    socket.on('connect', () => {
      expect(log.didLogSubscribeMessage).toBe(false);
      done();
    });
  });
});

export class TestLogger extends ConsoleLogger {
  public didLogSubscribeMessage = false;
  override log(message: any, context?: string) {
    this.logCatcher(message);
  }
  override debug(message: any, context?: string) {
    this.logCatcher(message);
  }
  override error(message: any, stack?: string, context?: string) {
    this.logCatcher(message);
  }
  override warn(message: any, context?: string) {
    this.logCatcher(message);
  }

  private logCatcher(message: any) {
    console.log(message);
    // Only update the flag when it hasn't been set to true already
    if (
      message &&
      message == 'Subscribe SocketGateway. method to message message.' &&
      this.didLogSubscribeMessage === false
    ) {
      this.didLogSubscribeMessage = true;
    }
  }
}
