import { configuration } from '../configuration';
import { $ } from '../utils';

const region = configuration.Sam.REGION;
const bucketName = configuration.Parameters.BUCKET_NAME;

$`aws s3 mb s3://${bucketName} --region ${region} || true`;

const fpath = '.aws-sam/server.env';
await Bun.write(fpath, Object
    .entries(configuration.ServerEnvironment)
    .reduce((acc, [k, v]) => `${acc}${k}=${v}\n`, ''),
);
$`aws s3 cp ${fpath} s3://${bucketName}/server.env`;
