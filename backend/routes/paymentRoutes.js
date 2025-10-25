import { handleListPayments } from "../controllers/paymentContollers.js"
import { handleRecordPayment } from "../controllers/paymentContollers.js"
export  function handlePayment(req, res){
    const {url, method}= req

    if(url === '/payments/record' && method === "POST"){
        return handleRecordPayment(req, res)
    }

    if(url === '/payments/list' && method === "GET"){
        return handleListPayments(req, res)
    }
    res.writeHead(404)
    res.end(JSON.stringify({message: "payment route not found "}))

}1