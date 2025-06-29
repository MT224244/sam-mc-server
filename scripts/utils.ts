import { execSync } from 'node:child_process';

export const $ = (template: TemplateStringsArray, ...expressions: readonly string[]) => {
    const command = template.raw
        .map(x => x.replace(/\s?\\\r?\n[\s\t]*/g, ' '))
        .reduce((a, b, index) => a + `${expressions[index - 1] ?? ''}` + b, '')
        .trim();
    console.log(command);
    execSync(command, { stdio: 'inherit' });
};

export const $$ = (template: TemplateStringsArray, ...expressions: readonly string[]) => {
    const command = template.raw
        .map(x => x.replace(/\s?\\\r?\n[\s\t]*/g, ' '))
        .reduce((a, b, index) => a + `${expressions[index - 1] ?? ''}` + b, '')
        .trim();
    console.log(command);
    return execSync(command, { encoding: 'utf-8' }).slice(0, -2);
};

export const getAwsAccountId = () => {
    return $$`aws sts get-caller-identity --query Account --output text`;
};
