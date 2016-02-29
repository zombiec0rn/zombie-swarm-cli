import fs      from 'fs'
import yaml    from 'js-yaml'

let engines = {
  docker: {
    createServicePlan: function(service) {
      return `docker run -d ${service.image}` 
    }
  }
}

export function readConfigFile(args) {
  try {
    return yaml.safeLoad(fs.readFileSync(args.file))
  } catch(e) {
    throw e
    process.exit(1)
  }
}

export function createPlan(swarm, nodes) {
  // What should be created?
  let _default = swarm.services.default
  delete swarm.services.default
  let plan = []
  for (let serviceName in swarm.services) {
    let service = swarm.services[serviceName]
    console.log(service)
  }

//  let services = Object.keys(plan.services).map(serviceName => {
//    let service = plan.services[serviceName]
//    let _service
//    Object.keys(engines).forEach(engine => {
//      console.log(engine, service[engine])
//      if (service[engine]) _service = service[engine].createServicePlan(service)
//    })
//    return _service
//  })
  return plan 
}
