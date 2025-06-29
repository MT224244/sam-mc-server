import { Rcon } from 'minecraft-rcon-client';

import { RCON_PASSWORD, RCON_PORT } from '@/util/env';

export class RconClient {
    private client: Rcon;

    public constructor() {
        this.client = new Rcon({
            host: '127.0.0.1',
            port: RCON_PORT,
            password: RCON_PASSWORD,
        });
    }

    public async connect() {
        await this.client.connect();
    }

    public async send(command: string) {
        return await this.client.query(command);
    }

    public disconnect() {
        this.client.disconnect();
    }
}
