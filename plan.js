import fs           from 'fs'
import yaml         from 'js-yaml'
import scheduler    from '@zombiec0rn/zombie-scheduler' 
import zdiff        from '@zombiec0rn/zombie-service-diff'
import assign       from 'object.assign'
import uniq         from 'lodash.uniq'
import find         from 'lodash.find'
import randomString from 'random-string'
import * as utils   from './utils'

function scrambleFingerprint(service) {
  service.previousFingerprint = service.fingerprint
  service.fingerprint = randomString()
}

function getCurrent(nodes) {
  let services = nodes.reduce((services, node) => {
    let nodeServices = utils.extractServices(node)
    delete node.services
    return services.concat(nodeServices)
  }, [])

  // Detect duplicate fingerprints
  // Randomize duplicate fingerprint (make sure they are re-evaluated)
  let duplicates = utils.detectDuplicateFingerprints(services)
  services.forEach(s => {
    if (duplicates.indexOf(s.fingerprint) >= 0) {
      scrambleFingerprint(s)
    }
  })

  return services
}

export default function makePlan(nodes, _wanted) {
  /* PREPARING */ 
  // Extracting current services from nodes (with fingerprints)
  // Adding fingerprints to wanted
  let current = getCurrent(nodes)
  let wanted  = _wanted.map(s => {
    s.fingerprint = zdiff.fingerprint(s)
    return s
  })

  /* TAGS & PLACEMENTS */
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

  /* TAG & PLACEMENT SCHEDULING */
  var tagadds = []
  tags.forEach(t => {
    let tagplan = scheduler.spread(tagmap[t].nodes, tagmap[t].wanted)
    tagplan.add.forEach(s => {
      assign(s, wantedmap[s.id])
    })
    tagadds = tagadds.concat(tagplan.add)
  })

  /* FINAL SCHEDULING */ 

  // We trust tagadds over current (we might have changed tags)
  // If a tagadd is in current we randomize the fingerprint to ensure re-eval 
  current.forEach(s => {
    let tagadd = find(tagadds, { id: s.id })
    if (!tagadd) return
    if (tagadd.host.hostname != s.host.hostname) {
      // Host mismatch
      scrambleFingerprint(s)
    }
    else if (tagadd.fingerprint != s.fingerprint) {
      // Fingerprint mismatch
      // Modifications to the same service - still tagged to same host
      scrambleFingerprint(s)
    }
    else {
      // No mismatch - keep in current / remove from tagadds
      tagadds = tagadds.filter(ta => ta.id != s.id)
    }
  })

  let plan = scheduler.spread(nodes, wanted, current.concat(tagadds))
  let tagaddids = tagadds.map(s => s.id) 
  plan.keep = plan.keep.filter(s => {
    let istagadd = tagaddids.indexOf(s.id) >= 0
    if (istagadd) plan.add.push(s) // unshift ? make room for tagged services first ??
    return !istagadd
  })

  /* CLEANUPS */
  // Add the fingerprint as env variable and remove property
  plan.add.forEach(s => {
    if (!s.env) s.env = []
    s.env.push(`ZOMBIE_SWARM_FINGERPRINT=${s.fingerprint}`)
    delete s.fingerprint
  })
  //console.log('PLAN', JSON.stringify(plan, null, 2))

  return plan 
}
