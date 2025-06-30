import type { Stats } from 'node:fs';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

import type { FSWatcher } from 'chokidar';
import { watch } from 'chokidar';
import { EventEmitter } from 'eventemitter3';

import {
    GAMEDATA_DIR,
    PLAYER_CHAT_LOG_REGEXP,
    PLAYER_INFORMATION_LOG_REGEXP,
    PLAYER_JOINED_LOG_REGEXP,
    PLAYER_LEFT_LOG_REGEXP,
    SERVER_START_LOG_REGEXP,
    SERVER_STOP_LOG_REGEXP,
} from '@/util/env';

interface LogWatcherEvents {
    startServer: [];
    stopServer: [];
    playerInformation: [id: string, uuid: string];
    playerJoined: [id: string];
    playerLeft: [id: string];
    playerChat: [id: string, chat: string];
}

export class LogWatcher extends EventEmitter<LogWatcherEvents> {
    private watcher?: FSWatcher = undefined;
    private lastSize = 0;

    public start() {
        const logFilePath = LogWatcher.getLogFilePath();

        if (LogWatcher.isLogFileExists()) {
            const stat = statSync(logFilePath);
            this.lastSize = stat.size;
        }

        this.watcher = watch(logFilePath, {
            usePolling: true,
            interval: 1000,
        });

        this.watcher.on('change', this.onChange.bind(this));
    }

    public async stop() {
        await this.watcher?.close();
    }

    public static isLogFileExists() {
        return existsSync(this.getLogFilePath());
    }

    private static getLogFilePath() {
        return path.join(GAMEDATA_DIR, 'logs/latest.log');
    }

    private async onChange(fpath: string, stats?: Stats) {
        if (!stats) return;
        if (stats.size === 0) return;

        if (stats.size < this.lastSize) {
            this.lastSize = 0;
        }

        const stream = Bun.file(fpath).slice(this.lastSize).stream();
        this.lastSize = stats.size;

        const logText = await Bun.readableStreamToText(stream);
        const lines = logText.split('\n').filter(x => x);

        for (const line of lines) {
            console.log(line);

            const serverStartLog = SERVER_START_LOG_REGEXP.exec(line);
            if (serverStartLog) {
                this.emit('startServer');
                continue;
            }

            const serverStopLog = SERVER_STOP_LOG_REGEXP.exec(line);
            if (serverStopLog) {
                this.emit('stopServer');
                continue;
            }

            const playerInformationLog = PLAYER_INFORMATION_LOG_REGEXP.exec(line);
            if (playerInformationLog) {
                this.emit('playerInformation', playerInformationLog[1], playerInformationLog[2]);
                continue;
            }

            const playerJoinedLog = PLAYER_JOINED_LOG_REGEXP.exec(line);
            if (playerJoinedLog) {
                this.emit('playerJoined', playerJoinedLog[1]);
                continue;
            }

            const playerLeftLog = PLAYER_LEFT_LOG_REGEXP.exec(line);
            if (playerLeftLog) {
                this.emit('playerLeft', playerLeftLog[1]);
                continue;
            }

            const playerChatLog = PLAYER_CHAT_LOG_REGEXP.exec(line);
            if (playerChatLog) {
                this.emit('playerChat', playerChatLog[1], playerChatLog[2]);
                continue;
            }
        }
    }
}
