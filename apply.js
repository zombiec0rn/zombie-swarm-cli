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

export default function applyPlan(plan) {
  // perform depending on driver
  let add_cmds  = cdi.run(plan.add.map(removeOutputFields))
  let stop_cmds = cdi.stop(plan.remove.map(removeOutputFields))
  let rm_cmds   = cdi.rm(plan.remove.map(removeOutputFields))

  // run stop in paralell
  // then run rm
  // then run add

  return stop_cmds.concat(rm_cmds, add_cmds).join('\n') 
}

