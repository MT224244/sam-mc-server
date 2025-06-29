import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { createCommand } from '@/discord/util/createCommand';
import { sendOneCommand } from '@/mc/util/sendOneCommand';

import stopCommand from './stop';

export default createCommand({
    definition: new SlashCommandBuilder()
        .setName('cmd')
        .setDescription('サーバーへコマンドを送信します。')
        .addStringOption(option => option
            .setName('command')
            .setDescription('Minecraftのコマンド。スラッシュは不要です。')
            .setMinLength(1)
            .setMaxLength(256)
            .setRequired(true),
        ),

    execute: async (interaction) => {
        const mcCommand = `${interaction.options.get('command')?.value}`;

        // stopコマンドは専用の方に任せる
        if (/^\/?stop$/.test(mcCommand)) {
            await stopCommand.execute(interaction, stopCommand);
            return;
        }

        await interaction.deferReply();

        try {
            const res = await sendOneCommand(`${mcCommand}`);

            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setTitle(`${mcCommand}`)
                    .setDescription(res ? '```\n' + res + '\n```' : '-')
                    .setColor('#cc8d64'),
                ],
            });
        }
        catch {
            await interaction.editReply('コマンドの送信に失敗しました。');
        }
    },
});
