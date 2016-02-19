import fs   from 'fs'
import yaml from 'js-yaml'

try {
    let doc = yaml.safeLoad(fs.readFileSync('./zombie-swarm.yml'))
    console.log(doc)
} catch(e) {
    console.log(e)
}
