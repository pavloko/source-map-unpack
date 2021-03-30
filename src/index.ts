#!/usr/bin/env node
import * as fs from 'fs'
import chalk from 'chalk'
import { dirname, join, isAbsolute } from 'path'
import * as mkdirp from 'mkdirp'
import { SourceMapConsumer } from 'source-map'
import * as minimist from 'minimist'

const argv = minimist(process.argv.slice(2))
const projectNameInput = argv._[0]
const mapInput = argv._[1]

if (!projectNameInput || !mapInput) {
    console.log()
    console.log(chalk.white('Usage: unpack'), chalk.green('<project-directory> <path-to-map-file>'))
    console.log()
    console.log(chalk.blue('*Note:   Minified file should be placed under path specified in .map file.'))
    console.log()
    process.exit()
}

const pathToProject = join(process.cwd(), projectNameInput)
const pathToMap = isAbsolute(mapInput) ? mapInput : join(process.cwd(), mapInput)

if (fs.existsSync(pathToProject)) {
    console.log()
    console.log(chalk.red(`Project folder already exists at: ${pathToProject}`))
    console.log()
    process.exit()
}

if (!fs.existsSync(pathToMap)) {
    console.log()
    console.log(chalk.red(`Can't find map file under : ${pathToMap}`))
    console.log()
    process.exit()
}

try {
    const mapFile = fs.readFileSync(pathToMap, 'utf8')
    SourceMapConsumer.with(mapFile, null, (consumer: SourceMapConsumer) => {
        console.log(chalk.green(`Unpacking 🛍  your source maps 🗺`))
        const sources = (consumer as any).sources
        sources.forEach((source: string) => {
            const WEBPACK_SUBSTRING_INDEX = 11
            const content = consumer.sourceContentFor(source) as string
            const filePath = `${process.cwd()}/${projectNameInput}/${source.substring(WEBPACK_SUBSTRING_INDEX)}`
            mkdirp.sync(dirname(filePath))
            fs.writeFileSync(filePath, content)
        })
        console.log(chalk.green('🎉  All done! Enjoy exploring your code 💻'))
    })
} catch (err) {
    console.log(chalk.red('Oops! Something is wrong with the source map'), err)
    console.log(chalk.red('Make sure .min.js is correctly placed under the path specified in .map file'))
    console.log('STDERR: ')
    console.log(err)
}
