import fs        from 'fs'
import yaml      from 'js-yaml'
import scheduler from '@zombiec0rn/zombie-scheduler' 
import zdiff     from '@zombiec0rn/zombie-service-diff'
import assign    from 'object.assign'
import uniq      from 'lodash.uniq'

function getCurrent(nodes) {
  return nodes.reduce((services, node) => {
    let nodeServices = node.services.map(s => {
      s.host = node
      if (s.env) {
        s.env.forEach(e => {
          if (e.indexOf('ZOMBIE_SWARM_FINGERPRINT') == 0) {
            s.fingerprint = e.split('=')[1]
          }
        })
      }
      return s
    })
    delete node.services
    return services.concat(nodeServices)
  }, [])
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

  let currentids = current.map(s => s.id)
  tagadds = tagadds.filter(s => currentids.indexOf(s.id) < 0)
  let wantedids = wanted.map(s => s.id)
  let tagaddids = tagadds.map(s => s.id) 
  let wantedfingerprints = wanted.map(s => {
    let unified = scheduler.unify([s])[0]
    return { id: s.id, fingerprint: zdiff.fingerprint(unified) }
  })

  //console.log('WANTED', wanted)
  //console.log('CURRENT', current.concat(tagadds))
  //console.log('TAGADDIDS', tagaddids)

  let plan = scheduler.spread(nodes, wanted, current.concat(tagadds))
  plan.keep = plan.keep.filter(s => {
    let istagadd = tagaddids.indexOf(s.id) >= 0
    if (istagadd) plan.add.push(s) // unshift ? make room for tagged services first ??
    return !istagadd
  })

  plan.add.forEach(s => {
    if (!s.env) s.env = []
    let fingerprint = wantedfingerprints.filter(fp => fp.id == s.id)[0].fingerprint
    s.env.push(`ZOMBIE_SWARM_FINGERPRINT=${fingerprint}`)
  })

  //console.log('PLAN', JSON.stringify(plan, null, 2))

  return plan 
}
