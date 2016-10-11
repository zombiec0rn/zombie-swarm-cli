import cdi from 'cccf-docker-instructions'
import clone from 'clone'

function removeOutputFields(s) {
  let service = clone(s)
  delete service.placement
  delete service.driver
  service.host = `tcp://${service.host.ip}:4243`
  service.memory = service.memory+'b'
  service['cpu-shares'] = service.cpu
  delete service.cpu
  return service
}

export default function applyPlan(plan, args) {
  args = args || {}
  // perform depending on driver
  let add_cmds  = cdi.run(plan.add.map(removeOutputFields))
  let stop_cmds = cdi.stop(plan.remove.map(removeOutputFields))
  let rm_cmds   = cdi.rm(plan.remove.map(removeOutputFields))

  // TODO: run stop + rm (for each container) in paralell, then run add
  
  if (args['always-remove']) {
    let rmIds = plan.remove.map(p => p.id)
    let addIds = plan.add.map(p => p.id)
    let allNew = plan.add.filter(a => rmIds.indexOf(a.id) < 0)
    let always_remove = cdi.rm(allNew.map(removeOutputFields)) 
    rm_cmds = rm_cmds.concat(always_remove)
  }

  return stop_cmds.concat(rm_cmds, add_cmds)
}

