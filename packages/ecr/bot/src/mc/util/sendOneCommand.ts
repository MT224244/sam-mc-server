import { RconClient } from '@/mc/RconClient';

/**
 * Rconでコマンドを送信する
 * @param command
 * @returns
 */
export const sendOneCommand = async (command: string) => {
    const rcon = new RconClient();

    await Promise.race([
        rcon.connect(),
        Bun.sleep(1000).then(() => {
            throw Error('Rcon connect timed out.');
        }),
    ]);

    const res = await rcon.send(command);

    rcon.disconnect();

    return res;
};
