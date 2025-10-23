import {handleCreateGroup, handleJoinGroup, listGroups} from  '../controllers/groupController.js'
export async function  handleGroups(req, res){
   const {url, method}= req.url

   if(url==='/groups/create' && method === "POST" ){
    handleCreateGroup(req, res)
    return
   }

   if(url=== '/groups/join' && method === "POST"){
    handleJoinGroup(req, res)
    return
   }
   if(url === '/groups' && method === 'GET'){
      listGroups(req, res)
   }
   res.writeHead(404, {'Content-Type': 'application/json'})
   res.end(JSON.stringify({message: "Group route not found"}))
   
}