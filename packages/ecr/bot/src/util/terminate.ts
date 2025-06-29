import { ECSClient, UpdateServiceCommand } from '@aws-sdk/client-ecs';

import { sendOneCommand } from '@/mc/util/sendOneCommand';
import { CLUSTER_NAME, SERVICE_NAME } from '@/util/env';

/**
 * ECSタスクを停止する
 */
export const terminate = async () => {
    try {
        await sendOneCommand('save-all');
    }
    catch (err) {
        console.error(err);
    }

    const ecs = new ECSClient();
    await ecs.send(new UpdateServiceCommand({
        cluster: CLUSTER_NAME,
        service: SERVICE_NAME,
        desiredCount: 0,
    }));
};
