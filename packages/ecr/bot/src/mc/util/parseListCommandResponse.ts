import { LIST_COMMAND_REGEXP } from '@/util/env';

interface ListCommandResponse {
    count: number;
    max: number;
    users: string[];
}

/**
 * listコマンドの結果をパースする
 * @param res listコマンドの結果
 * @returns
 */
export const parseListCommandResponse = (res: string): ListCommandResponse | undefined => {
    const listCommand = LIST_COMMAND_REGEXP.exec(res.trim());
    if (!listCommand) return undefined;

    const [, count, max, users] = listCommand;

    return {
        count: Number(count),
        max: Number(max),
        users: users.split(', ').filter(x => x),
    };
};
