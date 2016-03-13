import fs        from 'fs'
import yaml      from 'js-yaml'
import scheduler from '@zombiec0rn/zombie-scheduler' 
import cdi       from 'cccf-docker-instructions'
import assign    from 'object.assign'
import uniq      from 'lodash.uniq'

function getCurrent(nodes) {
  return []
}

function removeOutputFields(service) {
  delete service.placement
  delete service.driver
  service.host = `tcp://${service.host.ip}:4243`
  service.memory = service.memory+'b'
  service['cpu-shares'] = service.cpu
  delete service.cpu
  return service
}

export function formatPlan(plan) {
  // depending on driver
  let add_cmds = cdi.run(plan.add.map(removeOutputFields))
  let rm_cmds = cdi.rm(plan.remove.map(removeOutputFields))
  return rm_cmds.concat(add_cmds).join('\n') 
}

export default function makePlan(nodes, wanted) {
  let current = getCurrent(nodes)

  let tags = uniq(nodes.reduce((t, n) => {
    return t.concat(n.tags || [])
  },[]).concat(wanted.reduce((t,s) => {
    return t.concat(s.placement || [])
  },[])))

  let tagmap = tags.reduce((m, t) => {
    m[t] = {}
    m[t].nodes = nodes.filter(n => (n.tags || []).indexOf(t) >= 0)
    m[t].wanted = wanted.filter(s => (s.placement || []).indexOf(t) >= 0)
    return m
  },{})

  let wantedmap = wanted.reduce((m, s) => {
    m[s.id] = s
    return m
  },{})

  // TODO: Sometimes we need to place on all tags, or.. ?
  // Perhaps we need to add another property or expand tag (stick:gateway)
  // to support both "on one of these" and "on all of these"
  // Right now I think we only support "on one of these"

  var tagadds = []
  tags.forEach(t => {
    let tagplan = scheduler.spread(tagmap[t].nodes, tagmap[t].wanted)
    tagplan.add.forEach(s => {
      assign(s, wantedmap[s.id])
    })
    tagadds = tagadds.concat(tagplan.add)
  })

  let wantedids = wanted.map(s => s.id)
  let tagaddids = tagadds.map(s => s.id) 

  let plan = scheduler.spread(nodes, wanted, current.concat(tagadds))
  plan.keep = plan.keep.filter(s => {
    let istagadd = tagaddids.indexOf(s.id) >= 0
    if (istagadd) plan.add.push(s) // unshift ? make room for tagged services first ??
    return !istagadd
  })

  return formatPlan(plan) 
}
