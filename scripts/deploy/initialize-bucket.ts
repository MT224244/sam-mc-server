import { configuration } from '../configuration';
import { $ } from '../utils';

const region = configuration.Sam.REGION;
const bucketName = configuration.Parameters.BUCKET_NAME;

$`aws s3 mb s3://${bucketName} --region ${region} || true`;

const serverEnvFilePath = '.aws-sam/server.env';
await Bun.write(serverEnvFilePath, Object
    .entries(configuration.ServerEnvironment)
    .reduce((acc, [k, v]) => `${acc}${k}=${v}\n`, ''),
);
$`aws s3 cp ${serverEnvFilePath} s3://${bucketName}/server.env`;

const botEnvFilePath = '.aws-sam/bot.env';
await Bun.write(botEnvFilePath, Object
    .entries({
        DISCORD_CHANNEL_ID: configuration.Parameters.DISCORD_CHANNEL_ID,
        SERVER_START_LOG_REGEXP: configuration.Parameters.SERVER_START_LOG_REGEXP,
        SERVER_STOP_LOG_REGEXP: configuration.Parameters.SERVER_STOP_LOG_REGEXP,
        PLAYER_JOINED_LOG_REGEXP: configuration.Parameters.PLAYER_JOINED_LOG_REGEXP,
        PLAYER_LEFT_LOG_REGEXP: configuration.Parameters.PLAYER_LEFT_LOG_REGEXP,
        PLAYER_CHAT_LOG_REGEXP: configuration.Parameters.PLAYER_CHAT_LOG_REGEXP,
        LIST_COMMAND_REGEXP: configuration.Parameters.LIST_COMMAND_REGEXP,
        AUTO_SHUTDOWN_MINUTES: configuration.Parameters.AUTO_SHUTDOWN_MINUTES,
        RCON_PORT: configuration.Parameters.RCON_PORT,
        SERVER_PORT: configuration.Parameters.SERVER_PORT,
        MOTD: configuration.Parameters.MOTD,
        CLOUDFLARE_ZONE_ID: configuration.Parameters.CLOUDFLARE_ZONE_ID,
        CLOUDFLARE_RECORD_ID: configuration.Parameters.CLOUDFLARE_RECORD_ID,
    })
    .reduce((acc, [k, v]) => `${acc}${k}=${v}\n`, ''),
);
$`aws s3 cp ${botEnvFilePath} s3://${bucketName}/bot.env`;
