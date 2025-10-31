import {handleCreateGroup,
    handleJoinGroup,handleViewPayouts,
     listGroups,handlePayout,
      handleContribute, handleUserTotal, handleViewContributions} from  '../controllers/groupController.js'
export async function  handleGroups(req, res){
   const {url, method}= req

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
      return
   }
  if (url.match(/^\/groups\/([^\/]+)\/contribute$/) && method === 'POST') {
  req.groupId = url.split('/')[2]; // extract the groupId from the URL
  handleContribute(req, res);
  return;
}

if (url === "/groups/view" && method === "POST") return handleViewContributions(req, res);
if (url === "/groups/user-total" && method === "POST") return handleUserTotal(req, res);
if (url === "/groups/payout" && method === "POST") return handlePayout(req, res);
if (url === "/groups/payouts" && method === "POST") return handleViewPayouts(req, res);

   res.writeHead(404, {'Content-Type': 'application/json'})
   res.end(JSON.stringify({message: "Group route not found"}))
   
}