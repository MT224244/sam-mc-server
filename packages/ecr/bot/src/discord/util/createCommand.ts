import type { AnySelectMenuInteraction, ButtonInteraction, ChatInputCommandInteraction, Client, SharedSlashCommand } from 'discord.js';

type Promisable<T> = Promise<T> | T;

type CommandActionInteraction =
    | ButtonInteraction
    | AnySelectMenuInteraction;

interface CommandAction<P> {
    customId: string;
    execute: (interaction: CommandActionInteraction, context: Command<P>) => Promisable<void>;
}

export interface Command<P> {
    props: P;
    definition: SharedSlashCommand;
    execute: (interaction: ChatInputCommandInteraction, context: Command<P>) => Promisable<void>;
    actions: CommandAction<P>[];
    dispose?: (client: Client, context: Command<P>) => Promisable<void>;
}

/**
 * スラッシュコマンドの定義と処理を作成する
 * @param command
 * @returns
 */
export const createCommand = <P>(command: {
    props?: P;
    definition: SharedSlashCommand;
    execute: (interaction: ChatInputCommandInteraction, context: Command<P>) => Promisable<void>;
    actions?: CommandAction<P>[];
    dispose?: (client: Client, context: Command<P>) => Promisable<void>;
}): Command<P> => ({
    props: command.props!,
    definition: command.definition,
    execute: command.execute,
    actions: command.actions ?? [],
    dispose: command.dispose,
});
