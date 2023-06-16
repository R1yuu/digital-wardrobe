export async function getCollections() {
    const restPath = "/rest/collections"
    return await fetch(restPath)
        .then(data => { return data.json(); })
}