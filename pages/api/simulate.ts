import { exec } from 'child_process';
import { NextApiHandler } from "next"
import { promises as fs } from 'fs'
import admzip from 'adm-zip'
import { GCsimResult } from '../../type';
import PQueue from 'p-queue';

async function execAsPromise(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            resolve(stdout);
        });
    });
}

const handler: NextApiHandler = async (req, res) => {
    const body: {
        scripts: string[]
    } = req.body;
    const tasks = body.scripts.map((script, i) => {
        return async () => {
            const temp_name = `${Math.random()}+${Date.now()}_${i}`;
            await fs.writeFile(temp_name + '.txt', script)
            await execAsPromise(`./bin/gcsim -c=${temp_name}.txt -out=./${temp_name}.json`)
            const file = await fs.readFile(temp_name + '.json', 'utf-8')
            const data: GCsimResult = JSON.parse(file)
            const { debug, ...take } = data
            await execAsPromise(`rm -rf ${temp_name}.txt ${temp_name}.json`)
            return JSON.stringify(take)
        }
    })

    const zip = new admzip()
    const queue = new PQueue({ concurrency: 4 });
    const results = await queue.addAll(tasks)
    results.forEach((v, i) => {
        zip.addFile(`${i}.json`, Buffer.from(v, 'utf-8'))
    })
    res.status(200).send(zip.toBuffer())
}

export default handler