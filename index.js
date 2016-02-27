import fs      from 'fs'
import yaml    from 'js-yaml'
import iproute from 'iproute'
import _mdns   from 'multicast-dns'

try {
    let doc = yaml.safeLoad(fs.readFileSync('./zombie-swarm.yml'))
    console.log(doc)
} catch(e) {
    console.log(e)
}

let mdns = _mdns({
  interface: '10.144.187.134'
})

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

let route = { 
  type: 'unicast', 
  to: '224.0.0.0/4', 
  dev: 'zt3', 
  scope: 'link' 
}
iproute.route.add(route, (err) => {
  if (err) console.log(err)
})

//so the program will not close instantly
process.stdin.resume();

function exitHandler(options, err) {
  iproute.route.delete(route, (err) => {
    if (err) console.log(err)
    process.exit()
  })
  console.log('EXIT HANDLER')
//    if (options.cleanup) console.log('clean');
//    if (err) console.log(err.stack);
//    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
