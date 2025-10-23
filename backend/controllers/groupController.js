import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const filePath =  path.join(__dirname,'../data/groups.json')

async function  readGroups() {
   const data = await fs.readFile(filePath,'utf-8')
   return JSON.parse(data)
}

async function  writeGroups(group) {
    await fs.writeFile(filePath, JSON.stringify(group, null, 2))
    
}

export function listGroups(req, res){
    const groups = readGroups()
    res.writeHead(200)
    return res.end(JSON.stringify(groups))
}

export  function handleCreateGroup(req, res){
    let body =""
    req.on('data', chuck => body+= chuck)
    req.on('end', async()=> {
        try{
            const {name, frequency, duration, creator} = JSON.parse(body)
                if (!name || !frequency || !duration || !creator) {
          res.writeHead(400);
          return res.end(JSON.stringify({ message: "Missing fields" }));
        }
        const groups = await readGroups()
         const newGroup={
            id: Date.now(),
            name: name.trim(),
            frequency,
            duration,
            members: [creator.trim()]

         }
         groups.push(newGroup)
         writeGroups(groups)

         res.writeHead(201)
         return res.end(JSON.stringify({message: "Ajo group created", group: newGroup}))
        

        }catch(err){
            res.writeHead(400)
            return res.end(JSON.stringify({message: "Invalid JSON"}))
        }
    })
    return
}

export function handleJoinGroup(req, res){
     let body =""
    req.on('data', chuck => body+= chuck)
    req.on('end', async()=> {
        try{
            const {groupId, userEmail} = JSON.parse(body)
            const groups =  await readGroups()
            const group = groups.find((g)=> g.id === groupId)
            if(!group){
                res.writeHead(404);
                return res.end(JSON.stringify({message: "Groups not found"}))
            }
            if(!group.members.includes(userEmail)){
               group.members.push(userEmail)
               writeGroups(groups)
            }
            res.writeHead(200)
            return res.end(JSON.stringify({message: "Joined successfully", group}))

        }catch(err){
                 res.writeHead(400);
        return res.end(JSON.stringify({ message: "Invalid JSON" }));
        }

    })
    return
}