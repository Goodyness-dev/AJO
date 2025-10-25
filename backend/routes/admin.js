import path from 'node:path'
import fs from 'fs/promises'
import { fileURLToPath } from 'node:url'
import { ADMIN_TOKEN } from '../config/admin'
const fileName =  fileURLToPath(import.meta.url)
const dirName =  path.dirname(fileName)

const userPath = path.join(dirName, 'users.json')
const groupsPath = path.join(dirName, "groups.json")
export async function handleAdmin(req, res){
    const { url, method, headers} = req
    if (!headers.authorization || headers.authorization !== `Bearer ${ADMIN_TOKEN}`){
        res.writeHead(403)
        return res.end(JSON.stringify({message: "Unauthorized  - Admin only"}))
    }

    if ( url === '/admin/overview' && method === "GET"){
        try{
            const users = JSON.parse(await fs.readFile(userPath, 'utf8'))
            const groups = JSON.parse(await fs.readFile(groupsPath, 'utf-8'))

            const toatalGroups = groups.length;
            const totalUsers = users.length
            const totalMembers = groups.reduce((acc, g)=> acc + g.members.length, 0)

            const totalContributions = groups.reduce((acc, g)=> acc + (g.totalContributions || 0), 0)

            const stats = {
                toatalGroups,
                totalUsers,
                totalMembers,
                totalContributions,
                averageGroupSize: totalMembers/ (toatalGroups|| 1)
            }

            res.writeHead(200, {'Content-Type': "application/json"})
            res.end(JSON.stringify({message: "admin overview", stats}))

        }catch(err){
            res.writeHead(500)
            return res.end(JSON.stringify({message: " Server error"}))

        }
    }
    else if (url ==='/admin/groups' && method === 'GET'){
        const groups = JSON.parse(await fs.readFile(groupsPath, 'utf-8'))
        res.writeHead(200)
        return res.end(JSON.stringify(groups))
    }
    else  if (url==='/admin/users' && method === "GET"){
        const users = JSON.parse(await fs.readFile(userPath, 'utf-8'))
        res.writeHead(200)
        return res.end(JSON.stringify(users))
    }
    else{
        res.writeHead(404)
        res.end(JSON.stringify({message: "Admin route not found"}))
    }

}