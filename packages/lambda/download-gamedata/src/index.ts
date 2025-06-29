import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default {
    fetch: async (req: Request) => {
        const url = new URL(req.url);
        const bucketName = url.searchParams.get('b');
        const key = url.searchParams.get('k');

        if (!bucketName || !key) {
            return new Response('パラメータが不足しています', {
                status: 400,
            });
        }

        try {
            const s3 = new S3Client();

            const url = await getSignedUrl(s3, new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            }), { expiresIn: 1000 * 10 });

            console.log('Url:', url);

            return Response.redirect(url);
        }
        catch (err) {
            console.error(err);

            return new Response('ダウンロードに失敗しました', {
                status: 500,
            });
        }
    },
};
