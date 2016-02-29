import fs      from 'fs'
import yaml    from 'js-yaml'

export function readConfigFile(args) {
  try {
    return yaml.safeLoad(fs.readFileSync(args.file))
  } catch(e) {
    throw e
    process.exit(1)
  }
}

export function createPlan(plan, nodes) {
  console.log('creating plan', plan, nodes)
}
