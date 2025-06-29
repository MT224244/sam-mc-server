import { configuration } from '../configuration';
import { $ } from '../utils';

const region = configuration.Sam.REGION;
const bucketName = configuration.Parameters.BUCKET_NAME;

$`aws s3 rm s3://${bucketName} --region ${region} --recursive || true`;
$`aws s3 rb s3://${bucketName} --region ${region} --force || true`;
