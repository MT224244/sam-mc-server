import { configuration } from '../configuration';
import { $ } from '../utils';

const stackName = configuration.Sam.STACK_NAME;
const region = configuration.Sam.REGION;

$`sam delete --stack-name ${stackName} --region ${region} || true`;
