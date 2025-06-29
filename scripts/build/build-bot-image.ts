import { configuration } from '../configuration';
import { $, getAwsAccountId } from '../utils';

const awsAccountId = getAwsAccountId();

const region = configuration.Sam.REGION;
const botImageName = configuration.Parameters.BOT_IMAGE_NAME;

$`docker build -t ${awsAccountId}.dkr.ecr.${region}.amazonaws.com/${botImageName} packages/ecr/bot`;
