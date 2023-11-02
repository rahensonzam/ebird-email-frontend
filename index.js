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

    // console.log(birdData);

    const centerPosition = { lat: -17.8452628, lng: 25.803017 };

    map = new Map(document.getElementById("map"), {
        center: centerPosition,
        zoom: 12,
        mapId: "DEMO_MAP_ID"
    });

    let markersNested = [];
    let markers = [];

    // Create an info window to share between markers.
    const infoWindow = new InfoWindow();

    outerLoop: for (let indexA = 0; indexA <= birdData.length - 1; indexA++) {
        const bird = birdData[indexA];
        if (indexA === 0) {
            markersNested.push([birdData[indexA]]);
            continue;
        }
        for (let indexB = 0; indexB <= markersNested.length - 1; indexB++) {
            const nestedMarker = markersNested[indexB][0];
            if (bird.lat1 === nestedMarker.lat1 && bird.lng1 === nestedMarker.lng1) {
                markersNested[indexB].push(birdData[indexA]);
                continue outerLoop;
            }
        }
        markersNested.push([birdData[indexA]]);
    }

    console.log("markersNested", markersNested);

    // birdData.forEach((bird) => {
    for (let indexA = 0; indexA <= markersNested.length - 1; indexA++) {
        const birdPos = markersNested[indexA][0];

        let birdTitle = "";
        if (markersNested[indexA].length > 1) {
            birdTitle = "Various";
        } else {
            birdTitle = markersNested[indexA][0].commonname;
        }

        let contentString = `<div id="popupContent">`;
        for (let indexB = 0; indexB <= markersNested[indexA].length - 1; indexB++) {
            const bird = markersNested[indexA][indexB];
            contentString += `<p>${bird.commonname} <i>${bird.scientificname}</i><br>
            <b>Date Reported:</b> ${bird.datereported} <b>Reported By:</b> ${bird.reportedby}<br>
            <b>Location:</b> ${bird.locationname}<br>
            <b>Checklist:</b> <a href="${bird.checklistlink}">${bird.checklistlink}</a></p>`;
        }
        contentString += `</div>`;

        // console.log("contentString", contentString);

        const marker = new AdvancedMarkerElement({
            map: map,
            position: { lat: birdPos.lat1, lng: birdPos.lng1 },
            title: birdTitle,
        });

        marker.addListener("click", () => {
            infoWindow.close();
            infoWindow.setContent(contentString);
            // infoWindow.open(marker.map, marker);
            infoWindow.open({ anchor: marker, map });
        });

        markers.push(marker);

    }
    // });

    console.log("birdData", birdData);
    console.log("markers", markers);

}

initMap();