import fs      from 'fs'
import yaml    from 'js-yaml'
import cdi     from 'cccf-docker-instructions'
import assign  from 'object.assign'

let engines = {
  docker: {
    createServicePlan: function(serviceName, service, _default) {
      _default = _default || {}
      let _service = {}
      assign(_service, service, { id: serviceName }, _default)
      return cdi.run(_service) 
    }
  }
}

export function createPlan(swarm, nodes) {
  let current = getCurrent(nodes)
  let wanted  = getWanted(swarm)
  let hosts   = getHosts(nodes)
  let plan    = scheduler.spread(hosts, wanted, current) 
  return formatPlan(plan) 
}
