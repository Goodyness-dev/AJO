import { eventEmitter } from "../events/eventsManger.js";

export function handleEvents(req, res){
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": 'keep-alive'
    })
    res.write(`data: ${JSON.stringify({message: "connected to Ajo event stream"})}`)

const sendUpdate = (data)=> {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
}

eventEmitter.on("update", sendUpdate);

req.on('close', ()=> {
    eventEmitter.removeListener('update', sendUpdate)
})
}



