import { pascalCase } from 'change-case';

import { configuration } from '../configuration';
import { $, getAwsAccountId } from '../utils';

const awsAccountId = getAwsAccountId();

const stackName = configuration.Sam.STACK_NAME;
const region = configuration.Sam.REGION;
const bucketName = configuration.Parameters.BUCKET_NAME;
const botImageName = configuration.Parameters.BOT_IMAGE_NAME;

const parameterOverrides = [
    ...Object.entries({
        ...configuration.Parameters,
        ...configuration.Secrets,
    }).map(([k, v]) => {
        const key = pascalCase(k);
        const value = `${v}`.replaceAll(/(?<!\\)(['"])/g, '\\$1');
        return `${key}='${value}'`;
    }),
].join(' ');

$`sam deploy \
    --stack-name "${stackName}" \
    --region "${region}" \
    --s3-bucket "${bucketName}" \
    --capabilities "CAPABILITY_NAMED_IAM" \
    --confirm-changeset \
    --disable-rollback \
    --image-repository "${awsAccountId}.dkr.ecr.${region}.amazonaws.com/${botImageName}" \
    --parameter-overrides "${parameterOverrides}"`;
