import { DescribeNetworkInterfacesCommand, EC2Client } from '@aws-sdk/client-ec2';
import type { EventBridgeEvent } from 'aws-lambda';
import { Cloudflare } from 'cloudflare';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Events, GatewayIntentBits, MessageFlags, TextChannel } from 'discord.js';

import {
    CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_RECORD_ID,
    CLOUDFLARE_ZONE_ID,
    DISCORD_BOT_TOKEN,
    DISCORD_CHANNEL_ID,
    SERVER_START_FUNCTION_URL,
} from '@/env';

type EcsTaskStateChangeEvent = EventBridgeEvent<'ECS Task State Change', {
    lastStatus: 'RUNNING' | 'STOPPED';
    attachments: {
        details: {
            name: string;
            value: string;
        }[];
    }[];
}>;

const getPublicIp = async (event: EcsTaskStateChangeEvent) => {
    const eniId = event.detail.attachments
        .flatMap(x => x.details || [])
        .find(x => x.name === 'networkInterfaceId')?.value;

    console.log('NetworkInterfaceId:', eniId);

    if (!eniId) return;

    const ec2 = new EC2Client();

    const { NetworkInterfaces } = await ec2.send(new DescribeNetworkInterfacesCommand({
        NetworkInterfaceIds: [eniId],
    }));

    const ni = NetworkInterfaces?.[0];
    const publicIp = ni?.Association?.PublicIp;

    console.log('PublicIp:', publicIp);

    return publicIp;
};

const updateDnsRecordContent = async (cf: Cloudflare, zoneId: string, recordId: string, publicIp: string) => {
    const { name } = await cf.dns.records.get(recordId, { zone_id: zoneId });

    return await cf.dns.records.edit(recordId, {
        type: 'A',
        name,
        zone_id: zoneId,
        content: publicIp,
    });
};

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
    fetch: async (req: Request) => {
        try {
            const { event } = await req.json() as { event: EcsTaskStateChangeEvent; };

            const status = event.detail.lastStatus;

            if (status !== 'RUNNING' && status !== 'STOPPED') return;

            const cf = new Cloudflare({
                apiToken: CLOUDFLARE_API_TOKEN,
            });

            let ip = '0.0.0.0';

            if (status === 'RUNNING') {
                const publicIp = await getPublicIp(event);
                if (!publicIp) {
                    return new Response();
                }

                ip = publicIp;
            }
            else if (status === 'STOPPED') {
                await sendDiscordMessage();
            }

            await updateDnsRecordContent(cf, CLOUDFLARE_ZONE_ID, CLOUDFLARE_RECORD_ID, ip);
        }
        catch (err) {
            console.error(err);
        }

        return new Response();
    },
};
