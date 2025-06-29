export const CLOUDFLARE_API_TOKEN = (() => {
    const value = Bun.env.CLOUDFLARE_API_TOKEN;
    if (!value) throw Error('CLOUDFLARE_API_TOKEN not found');
    return value;
})();

export const CLOUDFLARE_ZONE_ID = (() => {
    const value = Bun.env.CLOUDFLARE_ZONE_ID;
    if (!value) throw Error('CLOUDFLARE_ZONE_ID not found');
    return value;
})();

export const CLOUDFLARE_RECORD_ID = (() => {
    const value = Bun.env.CLOUDFLARE_RECORD_ID;
    if (!value) throw Error('CLOUDFLARE_RECORD_ID not found');
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

export const SERVER_START_FUNCTION_URL = (() => {
    const value = Bun.env.SERVER_START_FUNCTION_URL;
    if (!value) throw Error('SERVER_START_FUNCTION_URL not found');
    return value;
})();
