import type {
    Guild,
    Interaction,
    Message,
    MessageCreateOptions,
    OmitPartialGroupDMChannel,
    PresenceStatusData,
    Webhook,
} from 'discord.js';
import {
    ActivityType,
    Client,
    Events,
    GatewayIntentBits,
    TextChannel,
} from 'discord.js';
import EventEmitter from 'eventemitter3';

import { commands } from '@/discord/commands';
import { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID } from '@/util/env';

type UnionToIntersection<T> = (T extends unknown ? (k: T) => void : never) extends ((k: infer I) => void) ? I : never;

type ChatToken =
    | { text: string; }
    | { type: 'user'; id: string; name: string; }
    | { type: 'channel'; id: string; name: string; };

interface ChatEventContext {
    name: string;
    tokens: ChatToken[];
    message: OmitPartialGroupDMChannel<Message>;
}

interface BotClientEvents {
    chat: [context: ChatEventContext];
}

export class BotClient extends EventEmitter<BotClientEvents> {
    private client: Client;
    private guild?: Guild;
    private channel?: TextChannel;
    private webhook?: Webhook;

    public constructor() {
        super();

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });

        this.client.on(Events.InteractionCreate, this.onInteractionCreate.bind(this));
        this.client.on(Events.MessageCreate, this.onMessageCreate.bind(this));
    }

    public async login() {
        return new Promise<void>((resolve, reject) => {
            this.client.once(Events.ClientReady, async () => {
                try {
                    this.setPresence('dnd', '');

                    const channel = this.client.channels.cache.get(DISCORD_CHANNEL_ID);
                    if (channel instanceof TextChannel) {
                        this.channel = channel;
                        this.guild = channel.guild;

                        await channel.guild.commands.set(commands.map(x => x.definition));

                        const whName = `${this.client.user?.username} Webhook`;
                        const whs = await channel.fetchWebhooks();
                        const wh = whs.find(x => !x.isUserCreated() && x.name === whName);
                        if (wh) {
                            this.webhook = wh;
                        }
                        else {
                            this.webhook = await channel.createWebhook({ name: whName });
                        }

                        resolve();
                    }
                    else {
                        reject(Error('DISCORD_CHANNEL_ID is not a TextChannel'));
                    }
                }
                catch {
                    await this.client.destroy();
                }
            });
            this.client.login(DISCORD_BOT_TOKEN).catch(reject);
        });
    }

    public setPresence(status: PresenceStatusData, text: string) {
        this.client.user?.setPresence({
            activities: [{
                type: ActivityType.Custom,
                name: text,
            }],
            status,
        });
    }

    public async sendTextMessage(message: MessageCreateOptions) {
        return await this.channel?.send(message);
    }

    public async sendWebhook(username: string, avatarURL: string, content: string) {
        return await this.webhook?.send({
            username,
            avatarURL,
            content,
        });
    }

    public async destroy() {
        await this.guild?.commands.set([]);
        await this.webhook?.delete();
        await Promise.all(commands.map(command => command.dispose?.(
            this.client,
            command as UnionToIntersection<typeof command>,
        )));
        await this.client.destroy();
    }

    private async onInteractionCreate(interaction: Interaction) {
        if (interaction.channelId !== DISCORD_CHANNEL_ID) return;

        try {
            if (interaction.isChatInputCommand()) {
                const command = commands.find(x => x.definition.name === interaction.commandName);
                if (command) {
                    await command.execute(
                        interaction,
                        command as UnionToIntersection<typeof command>,
                    );
                }
            }
            else if (interaction.isMessageComponent()) {
                const command = commands.find(command => command.actions.some(action => action.customId === interaction.customId));
                const component = command?.actions.find(x => x.customId === interaction.customId);
                if (component) {
                    await component.execute(
                        interaction,
                        command as UnionToIntersection<typeof command>,
                    );
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    private onMessageCreate(message: OmitPartialGroupDMChannel<Message>) {
        if (message.author.bot) return;
        if (message.author.system) return;
        if (message.channelId !== DISCORD_CHANNEL_ID) return;

        const content = message.content;

        const regex = /<@(\d+)>|<#(\d+)>/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        const tokens: ChatToken[] = [];

        while ((match = regex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                tokens.push({ text: content.slice(lastIndex, match.index) });
            }

            if (match[1]) {
                const userId = match[1];
                const user = message.mentions.users.find(user => user.id === userId);
                if (user) {
                    tokens.push({ type: 'user', id: user.id, name: user.displayName });
                }
                else {
                    tokens.push({ text: `<@${userId}>` });
                }
            }
            else if (match[2]) {
                const channelId = match[2];
                const channel = message.mentions.channels.find(channel => channel.id === channelId);
                if (channel && channel instanceof TextChannel) {
                    tokens.push({ type: 'channel', id: channel.id, name: channel.name });
                }
                else {
                    tokens.push({ text: `<#${channelId}>` });
                }
            }

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < content.length) {
            tokens.push({ text: content.slice(lastIndex) });
        }

        this.emit('chat', {
            name: message.author.displayName,
            tokens,
            message,
        });
    }
}
