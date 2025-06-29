import { DescribeServicesCommand, ECSClient, UpdateServiceCommand } from '@aws-sdk/client-ecs';
import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';

import { CLUSTER_NAME, DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, SERVICE_NAME } from '@/env';

const isServerStarted = async (ecs: ECSClient) => {
    const res = await ecs.send(new DescribeServicesCommand({
        cluster: CLUSTER_NAME,
        services: [SERVICE_NAME],
    }));

    const desiredCount = res.services?.[0].desiredCount ?? 0;

    return desiredCount >= 1;
};

const updateService = async (ecs: ECSClient) => {
    await ecs.send(new UpdateServiceCommand({
        cluster: CLUSTER_NAME,
        service: SERVICE_NAME,
        desiredCount: 1,
    }));
};

const updateDiscordMessage = (messageId: string, content: string) => new Promise<void>((resolve) => {
    const bot = new Client({
        intents: [
            GatewayIntentBits.Guilds,
        ],
    });

    bot.once(Events.ClientReady, async () => {
        try {
            const channel = bot.channels.cache.get(DISCORD_CHANNEL_ID);

            if (channel instanceof TextChannel) {
                const message = await channel.messages.fetch(messageId);

                await message.edit({
                    content,
                    components: [],
                });
            }
        }
        finally {
            await bot.destroy();

            resolve();
        }
    });

    void bot.login(DISCORD_BOT_TOKEN);
});

export default {
    fetch: async (req: Request) => {
        const url = new URL(req.url);
        const msgId = url.searchParams.get('m');

        if (!msgId) return new Response('400 Bad request', { status: 400 });

        try {
            const ecs = new ECSClient();

            if (!await isServerStarted(ecs)) {
                await updateService(ecs);
                await updateDiscordMessage(msgId, 'サーバー起動中...これには数分かかる場合があります');
            }
            else {
                await updateDiscordMessage(msgId, '既にサーバーは起動しています');
            }
        }
        catch (err) {
            console.error(err);
        }

        return new Response('<script>window.open("","_self").close();</script>', {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    },
};
