import fs    from 'fs'
import yaml  from 'js-yaml'
import _mdns from 'multicast-dns'

try {
    let doc = yaml.safeLoad(fs.readFileSync('./zombie-swarm.yml'))
    console.log(doc)
} catch(e) {
    console.log(e)
}

let mdns = _mdns()

mdns.on('response', (res) => {
    let swarmAnswers = res.answers.reduce((found, answer) => {
        if (answer.name == 'zombie-swarm') found = res.answers
        return found
    }, null)
    if (!swarmAnswers) return
    console.log('answers', swarmAnswers)
})

let query = () => {
    mdns.query({
        questions: [{
            name : 'zombie-swarm',
            type : 'A'
        }]
    })
}
setInterval(query, 3000)
