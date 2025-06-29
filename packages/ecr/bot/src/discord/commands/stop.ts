import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    TextChannel,
} from 'discord.js';

import { createCommand } from '@/discord/util/createCommand';
import { DISCORD_CHANNEL_ID } from '@/util/env';
import { terminate } from '@/util/terminate';

export interface StopCommandProps {
    confirmMessageId: string | undefined;
};

export default createCommand<StopCommandProps>({
    props: {
        confirmMessageId: undefined,
    },

    definition: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('サーバーを停止します。'),

    execute: async (interaction, { props }) => {
        if (props.confirmMessageId) {
            try {
                const message = await interaction.channel?.messages.fetch(props.confirmMessageId);
                await message?.delete();
            }
            catch (err) {
                console.error(err);
            }
            finally {
                props.confirmMessageId = undefined;
            }
        }

        const res = await interaction.reply({
            content: 'サーバーを停止しますか？',
            components: [new ActionRowBuilder<ButtonBuilder>()
                .addComponents(new ButtonBuilder({
                    customId: 'stop/cancel',
                    label: 'キャンセル',
                    style: ButtonStyle.Secondary,
                }))
                .addComponents(new ButtonBuilder({
                    customId: 'stop/ok',
                    label: '停止',
                    style: ButtonStyle.Danger,
                })),
            ],
        });

        const message = await res.fetch();
        props.confirmMessageId = message.id;
    },

    actions: [
        {
            customId: 'stop/cancel',
            execute: async (interaction) => {
                await interaction.message.delete();
            },
        },
        {
            customId: 'stop/ok',
            execute: async (interaction) => {
                await interaction.deferReply();

                try {
                    await interaction.message.edit({
                        content: 'サーバーを停止します',
                        components: [],
                    });

                    await terminate();

                    await interaction.deleteReply();
                }
                catch (err) {
                    console.error(err);

                    await interaction.editReply({
                        content: 'サーバーの停止に失敗しました',
                    });
                }
            },
        },
    ],

    dispose: async (client, { props }) => {
        if (!props.confirmMessageId) return;

        try {
            const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
            if (channel instanceof TextChannel) {
                const message = await channel.messages.fetch(props.confirmMessageId);
                if (message.components.length > 0) {
                    await message.delete();
                }
            }
        }
        catch {
            //
        }
    },
});
