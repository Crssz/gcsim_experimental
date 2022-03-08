import { exec } from 'child_process';
import { NextApiHandler } from "next"
import { optimizationResult } from '../../store/slices/simulationSlice';
import { promises as fs } from 'fs'
import PQueue from 'p-queue'

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
    const body = req.body;
    const temp_name = `${Math.random()}+${Date.now()}`;
    await fs.writeFile(temp_name + '.txt', body.script)
    const queue = new PQueue({ concurrency: 4 });
    const dumb = new Array(body.fluidSubstats + 1)
        .fill(0)
        .map((_, i) => {
            return async () => {
                const temp_opt_name_index = `${temp_name}_${i}_opt`
                await execAsPromise(`./bin/gcsim -c=${temp_name}.txt -substatOptim=true -out=./${temp_opt_name_index}.txt  -options "total_liquid_substats=${i}" `)
                const file = `# ${i}\n` + await fs.readFile(temp_opt_name_index + '.txt', 'utf8')
                await execAsPromise(`rm -rf ${temp_opt_name_index}.txt`)
                return file
            }
        })
    const optimizedScripts = await queue.addAll(dumb)

    await execAsPromise(`rm -rf ${temp_name}.txt`)
    res.status(200).json({ optimizedScripts, error: null })
}

export default handler