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

export const GAMEDATA_DIR = (() => {
    const value = Bun.env.GAMEDATA_DIR;
    if (!value) throw Error('GAMEDATA_DIR not found');
    return value;
})();

export const SERVER_START_LOG_REGEXP = (() => {
    const value = Bun.env.SERVER_START_LOG_REGEXP;
    if (!value) throw Error('SERVER_START_LOG_REGEXP not found');
    return new RegExp(value);
})();

export const SERVER_STOP_LOG_REGEXP = (() => {
    const value = Bun.env.SERVER_STOP_LOG_REGEXP;
    if (!value) throw Error('SERVER_STOP_LOG_REGEXP not found');
    return new RegExp(value);
})();

export const PLAYER_JOINED_LOG_REGEXP = (() => {
    const value = Bun.env.PLAYER_JOINED_LOG_REGEXP;
    if (!value) throw Error('PLAYER_JOINED_LOG_REGEXP not found');
    return new RegExp(value);
})();

export const PLAYER_LEFT_LOG_REGEXP = (() => {
    const value = Bun.env.PLAYER_LEFT_LOG_REGEXP;
    if (!value) throw Error('PLAYER_LEFT_LOG_REGEXP not found');
    return new RegExp(value);
})();

export const PLAYER_CHAT_LOG_REGEXP = (() => {
    const value = Bun.env.PLAYER_CHAT_LOG_REGEXP ?? '';
    if (!value) throw Error('PLAYER_CHAT_LOG_REGEXP not found');
    return new RegExp(value);
})();

export const LIST_COMMAND_REGEXP = (() => {
    const value = Bun.env.LIST_COMMAND_REGEXP;
    if (!value) throw Error('LIST_COMMAND_REGEXP not found');
    return new RegExp(value);
})();

export const RCON_PASSWORD = (() => {
    const value = Bun.env.RCON_PASSWORD;
    if (!value) throw Error('RCON_PASSWORD not found');
    return value;
})();

export const RCON_PORT = (() => {
    const value = Bun.env.RCON_PORT;
    if (!value) throw Error('RCON_PORT not found');
    return Number(value);
})();

export const SERVER_START_FUNCTION_URL = (() => {
    const value = Bun.env.SERVER_START_FUNCTION_URL;
    if (!value) throw Error('SERVER_START_FUNCTION_URL not found');
    return value;
})();

export const DOWNLOAD_GAMEDATA_FUNCTION_URL = (() => {
    const value = Bun.env.DOWNLOAD_GAMEDATA_FUNCTION_URL;
    if (!value) throw Error('DOWNLOAD_GAMEDATA_FUNCTION_URL not found');
    return value;
})();

export const AUTO_SHUTDOWN_MINUTES = (() => {
    const value = Bun.env.AUTO_SHUTDOWN_MINUTES;
    if (!value) throw Error('AUTO_SHUTDOWN_MINUTES not found');
    return Number(value);
})();

export const BUCKET_NAME = (() => {
    const value = Bun.env.BUCKET_NAME;
    if (!value) throw Error('BUCKET_NAME not found');
    return value;
})();

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

export const MOTD = (() => {
    const value = Bun.env.MOTD;
    if (!value) throw Error('MOTD not found');
    return value;
})();

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

export const SERVER_PORT = (() => {
    const value = Bun.env.SERVER_PORT;
    if (!value) throw Error('SERVER_PORT not found');
    return Number(value);
})();
