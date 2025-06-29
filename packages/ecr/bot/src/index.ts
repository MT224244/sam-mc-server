import { EmbedBuilder } from 'discord.js';

import { BotClient } from '@/discord/BotClient';
import { LogWatcher } from '@/mc/LogWatcher';
import { parseListCommandResponse } from '@/mc/util/parseListCommandResponse';
import { sendOneCommand } from '@/mc/util/sendOneCommand';
import { AUTO_SHUTDOWN_MINUTES, SERVER_PORT } from '@/util/env';
import { getCloudflareRecord } from '@/util/getCloudflareRecord';
import { terminate } from '@/util/terminate';

console.log('Start bot');

while (!LogWatcher.isLogFileExists()) {
    console.log('Waiting for log file generation...');
    await Bun.sleep(1000);
}

const botClient = new BotClient();
const logWatcher = new LogWatcher();

let interval: NodeJS.Timeout | undefined = undefined;
let uninhabinantMinutes = 0;

process.on('SIGTERM', async () => {
    clearInterval(interval);
    await botClient.destroy();
    await logWatcher.stop();
    process.exit();
});
process.on('SIGINT', async () => {
    clearInterval(interval);
    await botClient.destroy();
    await logWatcher.stop();
    process.exit();
});

botClient.on('chat', async ({ name, tokens, message }) => {
    try {
        const command = 'tellraw @a ' + JSON.stringify([
            { text: '<' },
            { text: name, color: '#7289da' },
            { text: '> ' },
            ...tokens.map((token) => {
                if ('text' in token) return { text: token.text };
                else if (token.type === 'user') return {
                    text: `@${token.name}`,
                    color: '#aab9f0',
                };
                else if (token.type === 'channel') return {
                    text: `#${token.name}`,
                    color: '#aab9f0',
                };
                else return undefined;
            }).filter(x => x),
        ]);

        if (Buffer.byteLength(command) > 1446) {
            await message.react('⚠');
            return;
        }

        console.log(`<${name}>`, tokens.map((x) => {
            if ('text' in x) return x.text;
            else if (x.type === 'user') return `@${x.name}`;
            else if (x.type === 'channel') return `#${x.name}`;
            else return '';
        }).join(''));

        try {
            await sendOneCommand(command);
        }
        catch {
            await message.react('⚠');
            return;
        }
    }
    catch (err) {
        console.error(err);
    }
});

await botClient.login();

const updateBotPresence = async () => {
    const res = await sendOneCommand('list');
    const parsed = parseListCommandResponse(res);
    if (parsed) {
        botClient.setPresence('online', `[${parsed.count}/${parsed.max}]`);
    }
};

try {
    await updateBotPresence();
}
catch {
    botClient.setPresence('dnd', '');
}

const players = new Map<string, string>();

logWatcher.on('startServer', async () => {
    interval = setInterval(async () => {
        try {
            const res = await sendOneCommand('list');
            const parsed = parseListCommandResponse(res);
            if (!parsed) throw Error();

            if (parsed.count <= 0) {
                uninhabinantMinutes++;
            }
        }
        catch {
            await botClient.sendTextMessage({
                embeds: [new EmbedBuilder()
                    .setDescription([
                        'サーバーステータスの取得に失敗しました',
                        'サーバーは自動停止されません',
                    ].join('\n'))
                    .setColor('#eed202')
                    .setTimestamp(),
                ],
            });
        }

        if (uninhabinantMinutes >= AUTO_SHUTDOWN_MINUTES) {
            await botClient.sendTextMessage({
                embeds: [new EmbedBuilder()
                    .setDescription([
                        `誰もログインしていない状態で${AUTO_SHUTDOWN_MINUTES}分経過したため、サーバーを停止します`,
                    ].join('\n'))
                    .setColor('#eed202')
                    .setTimestamp(),
                ],
            });

            await terminate();
        }
    }, 1000 * 60);

    try {
        const cfRecord = await getCloudflareRecord();
        const port = SERVER_PORT === 25565 ? '' : `:${SERVER_PORT}`;

        await botClient.sendTextMessage({
            embeds: [new EmbedBuilder()
                .setDescription([
                    'サーバーが起動しました',
                    '`' + cfRecord.name + port + '` (IP: `' + cfRecord.content + '`)',
                ].join('\n'))
                .setColor('#43b581')
                .setTimestamp(),
            ],
        });

        try {
            await updateBotPresence();
        }
        catch {
            botClient.setPresence('online', '-');
        }
    }
    catch (err) {
        console.error(err);
    }
});
logWatcher.on('stopServer', async () => {
    clearInterval(interval);

    try {
        await botClient.sendTextMessage({
            embeds: [new EmbedBuilder()
                .setDescription('サーバーが停止しました')
                .setTimestamp()
                .setColor('#f04747'),
            ],
        });
        botClient.setPresence('dnd', '');
    }
    catch (err) {
        console.error(err);
    }
});
logWatcher.on('playerJoined', async (name, uuid) => {
    try {
        players.set(name, uuid);

        await botClient.sendTextMessage({
            embeds: [new EmbedBuilder()
                .setAuthor({ name, iconURL: `https://mc-heads.net/avatar/${uuid}` })
                .setDescription('ログインしました')
                .setColor('#79b59a')
                .setTimestamp(),
            ],
        });

        await updateBotPresence();
    }
    catch (err) {
        console.error(err);
    }
});
logWatcher.on('playerLeft', async (name) => {
    try {
        const uuid = players.get(name) ?? name;

        await botClient.sendTextMessage({
            embeds: [new EmbedBuilder()
                .setAuthor({ name, iconURL: `https://mc-heads.net/avatar/${uuid}` })
                .setDescription('ログアウトしました')
                .setColor('#f09090')
                .setTimestamp(),
            ],
        });

        await updateBotPresence();
    }
    catch (err) {
        console.error(err);
    }
});
logWatcher.on('playerChat', async (name, chat) => {
    try {
        const sorted = [...players.keys()].sort((a, b) => b.length - a.length);
        const key = sorted.find(x => name.includes(x)) ?? name;
        const uuid = players.get(key) ?? key;

        await botClient.sendTextMessage({
            embeds: [new EmbedBuilder()
                .setAuthor({ name: key, iconURL: `https://mc-heads.net/avatar/${uuid}` })
                .setDescription(chat)
                .setColor('#ffffff'),
            ],
        });
    }
    catch (err) {
        console.error(err);
    }
});

logWatcher.start();
