import fs        from 'fs'
import yaml      from 'js-yaml'
import scheduler from '@zombiec0rn/zombie-scheduler' 
import cdi       from 'cccf-docker-instructions'
import assign    from 'object.assign'

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

function getCurrent(nodes) {
  return []
}

export function formatPlan(plan) {
  // depending on driver
  return plan
}

export default function makePlan(nodes, swarm) {
  let current = getCurrent(nodes)
  let wanted  = swarm.services 
  // Do tag placement
  // * Assert all tags exists - throw if not
  // * Add tagged to 

  return scheduler.spread(nodes, wanted, current) 
}
