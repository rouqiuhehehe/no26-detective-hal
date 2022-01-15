import fsPromise from 'fs/promises';
import path from 'path';

export default async function () {
    let filename;
    if (process.env.NODE_ENV === 'development') {
        filename = '.env.development';
    } else {
        filename = '.env.production';
    }

    try {
        const data = (await fsPromise.readFile(path.join(process.cwd(), filename))).toString();

        data.split('\n').forEach((v) => {
            const st = v.replace(/\n|\r|\t|\"|\'/g, '').trim();

            const [key, value] = st.split('=');

            process.env[key] = value;
        });
    } catch (error) {
        // 当成没有环境变量
    }
}
