import '../delete/clear-bot-images';

import { configuration } from '../configuration';
import { $, getAwsAccountId } from '../utils';

const awsAccountId = getAwsAccountId();

const region = configuration.Sam.REGION;
const botImageName = configuration.Parameters.BOT_IMAGE_NAME;

$`aws ecr get-login-password --region ${region} | docker login \
    --username AWS \
    --password-stdin ${awsAccountId}.dkr.ecr.${region}.amazonaws.com`;

$`docker push ${awsAccountId}.dkr.ecr.${region}.amazonaws.com/${botImageName}:latest`;
