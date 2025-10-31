const BASE_URL = "http://localhost: 5000"



export async function getGroups(){
    const res =await fetch(`${BASE_URL}/groups/list`)
      return res.json()
}

export async function createGroup() {
    const res = await fetch(`${BASE_URL}/groups/create`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, frequency, duration, creator })

    })
    return res.json()
}