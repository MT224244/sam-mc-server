export const CLUSTER_NAME = (() => {
    const value = Bun.env.CLUSTER_NAME;
    if (!value) throw Error('CLUSTER_NAME not found');
    return value;
})();

export const SERVICE_NAME = (() => {
    const value = Bun.env.SERVICE_NAME;
    if (!value) throw Error('SERVICE_NAME not found');
    return value;
})();

export const DISCORD_BOT_TOKEN = (() => {
    const value = Bun.env.DISCORD_BOT_TOKEN;
    if (!value) throw Error('DISCORD_BOT_TOKEN not found');
    return value;
})();

export const DISCORD_CHANNEL_ID = (() => {
    const value = Bun.env.DISCORD_CHANNEL_ID;
    if (!value) throw Error('DISCORD_CHANNEL_ID not found');
    return value;
})();
