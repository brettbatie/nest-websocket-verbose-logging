import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';


@WebSocketGateway({
  pingTimeout: 60000,
  path: '/socket.io',
  allowEIO3: true,
  cors: { origin: [/localhost:[0-9]{4}$/] }
})
export class SocketGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log('hit');
    return 'Hello world!';
  }
}
