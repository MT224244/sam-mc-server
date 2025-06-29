import env from '../.env.toml';

interface Environment {
    Sam: {
        STACK_NAME: string;
        REGION: string;
    };
    Parameters: {
        AVAILABILITY_ZONE: string;
        BUN_LAYER_ARN: string;
        SERVER_CPU: number;
        SERVER_MEMORY: number;
        DISCORD_CHANNEL_ID: string;
        SERVER_START_LOG_REGEXP: string;
        SERVER_STOP_LOG_REGEXP: string;
        PLAYER_JOINED_LOG_REGEXP: string;
        PLAYER_LEFT_LOG_REGEXP: string;
        PLAYER_CHAT_LOG_REGEXP: string;
        LIST_COMMAND_REGEXP: string;
        AUTO_SHUTDOWN_MINUTES: number;
        CLOUDFLARE_ZONE_ID: string;
        CLOUDFLARE_RECORD_ID: string;
    };
    Secrets: {
        CLOUDFLARE_API_TOKEN: string;
        DISCORD_BOT_TOKEN: string;
    };
    ServerEnvironment: Record<string, string | number | boolean>;
}

export const ENV = env as Environment;

export const configuration = {
    Sam: ENV.Sam,
    Parameters: {
        ...ENV.Parameters,
        SERVER_PORT: ENV.ServerEnvironment.SERVER_PORT as number ?? 25565,
        RCON_PORT: ENV.ServerEnvironment.RCON_PORT as number ?? 25575,
        GAMEDATA_DIR: '/data',
        BUCKET_NAME: `${ENV.Sam.STACK_NAME}-stack`,
        CLUSTER_NAME: `${ENV.Sam.STACK_NAME}-cluster`,
        SERVICE_NAME: `${ENV.Sam.STACK_NAME}-service`,
        BOT_IMAGE_NAME: `${ENV.Sam.STACK_NAME}-bot-image`,
    },
    Secrets: {
        ...ENV.Secrets,
        RCON_PASSWORD: ENV.ServerEnvironment.RCON_PASSWORD as string,
    },
    ServerEnvironment: ENV.ServerEnvironment,
};
