import { PassThrough } from 'node:stream';

import { CreateBucketCommand, HeadBucketCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import archiver from 'archiver';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';

import { createCommand } from '@/discord/util/createCommand';
import { sendOneCommand } from '@/mc/util/sendOneCommand';
import { BUCKET_NAME, DOWNLOAD_GAMEDATA_FUNCTION_URL, GAMEDATA_DIR } from '@/util/env';

const createBucket = async (s3: S3Client) => {
    try {
        console.log('Checking if S3 bucket exists...');
        await s3.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        console.log('S3 bucket already exists');
    }
    catch (err) {
        if (!(err instanceof S3ServiceException)) return;

        if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
            console.log('Creating S3 bucket', BUCKET_NAME);
            await s3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        }
    }
};

const uploadGameData = async (s3: S3Client, stream: PassThrough) => {
    const date = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).replaceAll('/', '-');
    const key = `download/data_${date}.zip`;

    console.log('Uploading S3 object with key', key);

    const upload = new Upload({
        client: s3,
        params: {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: stream,
            ContentType: 'application/zip',
        },
    });

    await upload.done();

    return key;
};

export default createCommand({
    props: {
        isProcessing: false,
    },

    definition: new SlashCommandBuilder()
        .setName('download')
        .setDescription('サーバーのゲームデータをS3に保存し、ダウンロードURLを提供します。'),

    execute: async (interaction) => {
        await interaction.deferReply();

        try {
            await sendOneCommand('save-all');
        }
        catch (err) {
            console.error(err);
        }

        try {
            const s3 = new S3Client();
            await createBucket(s3);

            const stream = new PassThrough();

            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(stream);
            const uploadPromise = uploadGameData(s3, stream);

            archive.directory(GAMEDATA_DIR, false);
            await archive.finalize();

            const key = await uploadPromise;

            const url = new URL(DOWNLOAD_GAMEDATA_FUNCTION_URL);
            url.searchParams.set('b', BUCKET_NAME);
            url.searchParams.set('k', key);

            await interaction.editReply({
                components: [new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel('ダウンロード')
                        .setURL(url.href),
                    ),
                ],
            });
        }
        catch (err) {
            console.error(err);

            await interaction.editReply({
                content: 'ダウンロードファイルの生成に失敗しました',
            });
        }
    },
});
