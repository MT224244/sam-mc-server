import Cloudflare from 'cloudflare';

import { CLOUDFLARE_API_TOKEN, CLOUDFLARE_RECORD_ID, CLOUDFLARE_ZONE_ID } from './env';

export const getCloudflareRecord = async () => {
    const cf = new Cloudflare({ apiToken: CLOUDFLARE_API_TOKEN });

    return await cf.dns.records.get(CLOUDFLARE_RECORD_ID, {
        zone_id: CLOUDFLARE_ZONE_ID,
    });
};
