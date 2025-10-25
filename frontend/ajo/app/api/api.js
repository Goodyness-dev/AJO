const BASE_URL = "http://localhost: 5000"
export  async function registerUser(userData) {
    const res = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData)
    })
    

    return res.json()
}


export async function  loginUser(userData) {
    const res = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: {'Content-Type': 'application.json'},
        body: JSON.stringify(userData)
    })
    return res.json()
    
}

export async function getGroups(){
    const res =await fetch(`${BASE_URL}/groups/list`)
      return res.json()
}

export async function createGroup() {
    const res = await fetch(`${BASE_URL}/groups/create`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)

    })
    return res.json()
}