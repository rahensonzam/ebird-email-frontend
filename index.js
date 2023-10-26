let map;

document.getElementById("myInput").addEventListener("keyup", filterFunction)

async function makeWebRequest(url) {
    const data = await fetch(url);
    const res = await data.json();
    return res;
}

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");

    const birdData = await makeWebRequest("http://127.0.0.1:3000/api")

    console.log(birdData)

    map = new Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    });
}

initMap();