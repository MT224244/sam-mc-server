import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    EmbedBuilder,
    Events,
    GatewayIntentBits,
    MessageFlags,
    TextChannel,
} from 'discord.js';

import { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, SERVER_START_FUNCTION_URL } from '@/env';

const sendDiscordMessage = () => new Promise<void>((resolve) => {
    const bot = new Client({
        intents: [
            GatewayIntentBits.Guilds,
        ],
    });

    bot.once(Events.ClientReady, async () => {
        try {
            const channel = bot.channels.cache.get(DISCORD_CHANNEL_ID);
            if (channel instanceof TextChannel) {
                const url = new URL(SERVER_START_FUNCTION_URL);
                const message = await channel.send({
                    embeds: [new EmbedBuilder().setTitle('-')],
                    flags: MessageFlags.SuppressEmbeds,
                });
                url.searchParams.append('m', message.id);
                await message.edit({
                    components: [new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel('サーバーを起動する')
                            .setURL(url.href),
                        ),
                    ],
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
    fetch: async () => {
        await sendDiscordMessage();
        return new Response();
    },
};
