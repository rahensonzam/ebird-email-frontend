let map;

document.getElementById("myInput").addEventListener("keyup", filterFunction);

async function makeWebRequest(url) {
    const data = await fetch(url);
    const res = await data.json();
    return res;
}

async function initMap() {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const birdData = await makeWebRequest("http://127.0.0.1:3000/api");

    console.log(birdData);

    const centerPosition = { lat: -17.8452628, lng: 25.803017 };

    map = new Map(document.getElementById("map"), {
        center: centerPosition,
        zoom: 12,
        mapId: "DEMO_MAP_ID"
    });

    let markers = [];

    // Create an info window to share between markers.
    const infoWindow = new InfoWindow();

    birdData.forEach((bird) => {
        const marker = new AdvancedMarkerElement({
            map: map,
            position: { lat: bird.lat1, lng: bird.lng1 },
            title: bird.commonname,
        });

        markers.push(marker);

        let contentString = `<p>Common Name%3A ${bird.commonname}\nScientific Name%3A ${bird.scientificname}\nDate Reported%3A ${bird.datereported}\nReported By%3A ${bird.reportedby}\nLocation%3A ${bird.locationname}\nLat%3A ${bird.lat1}\nLng%3A ${bird.lng1}\nChecklist%3A <a href="${bird.checklistlink}">${bird.checklistlink}</a></p>`;

        marker.addListener("click", () => {
            infoWindow.close();
            infoWindow.setContent(contentString);
            // infoWindow.open(marker.map, marker);
            infoWindow.open({ anchor: marker, map });
        });

    });
}

initMap();