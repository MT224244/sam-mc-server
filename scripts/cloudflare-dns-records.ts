import Cloudflare from 'cloudflare';

import { configuration } from './configuration';

const cf = new Cloudflare({
    apiToken: configuration.Secrets.CLOUDFLARE_API_TOKEN,
});

const records = await cf.dns.records.list({ zone_id: configuration.Parameters.CLOUDFLARE_ZONE_ID });

console.log('----------------------------------------');
for await (const record of records) {
    console.log('ID:\n ', record.id);
    console.log('タイプ:\n ', record.type);
    console.log('名前:\n ', record.name);
    console.log('コンテンツ:\n ', record.content);
    console.log('コメント:\n ', record.comment ?? '-');
    console.log('----------------------------------------');
}
