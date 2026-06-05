import * as signalR from '@microsoft/signalr';
import { API_URL } from './api';

export type RtEvent =
  | 'acesso:novo'
  | 'encomenda:nova'
  | 'visitante:aguardando'
  | 'alerta:critico'
  | 'dispositivo:status'
  | 'ocorrencia:nova';

let connection: signalR.HubConnection | null = null;

export async function startRealtime(token: string, condominioId: string) {
  if (connection) await connection.stop().catch(() => {});
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/portaria?access_token=${token}`)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
  await connection.start();
  await connection.invoke('JoinCondominio', condominioId).catch(() => {});
  return connection;
}

export function on(event: RtEvent, handler: (data: any) => void) {
  if (!connection) return () => {};
  connection.on(event, handler);
  return () => connection?.off(event, handler);
}

export function isConnected() {
  return connection?.state === signalR.HubConnectionState.Connected;
}
