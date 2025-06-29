import { configuration } from '../configuration';
import { $, $$ } from '../utils';

const region = configuration.Sam.REGION;
const botImageName = configuration.Parameters.BOT_IMAGE_NAME;

const imageIds = JSON.parse($$`aws ecr list-images \
    --region ${region} \
    --repository-name ${botImageName} \
    --query "imageIds[*].imageDigest" \
    --output json || true` || '[]',
) as string[];

$`aws ecr batch-delete-image \
    --region ${region} \
    --repository-name ${botImageName} \
    --image-ids ${imageIds.map(x => `imageDigest=${x}`).join(' ')} || true`;
