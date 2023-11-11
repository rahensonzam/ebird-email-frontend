let map;
let markers = [];
dayjs.extend(window.dayjs_plugin_customParseFormat);
dayjs.extend(window.dayjs_plugin_isBetween);

let dropdown;

async function makeWebRequest(url) {
    const data = await fetch(url);
    const res = await data.json();
    return res;
}

async function initMap() {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    const birdData = await makeWebRequest("http://127.0.0.1:3000/api");

    // console.log(birdData);

    const centerPosition = { lat: -17.8452628, lng: 25.803017 };

    map = new Map(document.getElementById("map"), {
        center: centerPosition,
        zoom: 12,
        mapId: "DEMO_MAP_ID"
    });

    let defaultStartDate = dayjs("2023-01-01", "YYYY-MM-DD").format("YYYY-MM-DD");
    let defaultEndDate = dayjs().format("YYYY-MM-DD");

    let initialEndDate = dayjs().format("YYYY-MM-DD");
    let initialStartDate = dayjs(initialEndDate).subtract(1, "day").format("YYYY-MM-DD");
    document.getElementById("start").value = initialStartDate;
    document.getElementById("end").value = initialEndDate;

    populateDropdown(birdData);

    dropdown = new UseBootstrapSelect(document.getElementById("example-search"));

    placemarkers(InfoWindow, AdvancedMarkerElement, PinElement, birdData, defaultStartDate, defaultEndDate);

    document.getElementById("start").addEventListener("change", startDateChanged);
    document.getElementById("end").addEventListener("change", endDateChanged);
    document.getElementById("example-search").addEventListener("change", speciesChanged);

    function startDateChanged() {
        if (dayjs(document.getElementById("start").value).isAfter("1970-01-01", "day")) {
            placemarkers(InfoWindow, AdvancedMarkerElement, PinElement, birdData, defaultStartDate, defaultEndDate);
        }
    }

    function endDateChanged() {
        if (dayjs(document.getElementById("end").value).isAfter("1970-01-01", "day")) {
            placemarkers(InfoWindow, AdvancedMarkerElement, PinElement, birdData, defaultStartDate, defaultEndDate);
        }
    }

    function speciesChanged() {
        placemarkers(InfoWindow, AdvancedMarkerElement, PinElement, birdData, defaultStartDate, defaultEndDate);
    }

    console.log("birdData", birdData);
    console.log("markers", markers);
}

function placemarkers(InfoWindow, AdvancedMarkerElement, PinElement, birdData, defaultStartDate, defaultEndDate) {
    let markersNested = [];

    // Create an info window to share between markers.
    const infoWindow = new InfoWindow();

    // let startDate = dayjs("01-11-2023", "DD-MM-YYYY").format("YYYY-MM-DD");
    // let endDate = dayjs("04-11-2023", "DD-MM-YYYY").format("YYYY-MM-DD");

    let startDate = document.getElementById("start").value;
    let endDate = document.getElementById("end").value;

    if (!dayjs(startDate).isValid()) {
        startDate = defaultStartDate;
        document.getElementById("start").value = defaultStartDate;
    }
    if (!dayjs(endDate).isValid()) {
        endDate = defaultEndDate;
        document.getElementById("end").value = defaultEndDate;
    }

    const birdDataFilteredByDate = birdData.filter(obj => {
        let dateIsInRange = dayjs(obj.datereported).isBetween(startDate, endDate, 'day', '[]');
        return dateIsInRange;
    });

    console.log("birdDataFilteredByDate", birdDataFilteredByDate);

    let filterName = dropdown.getValue();

    const birdDataFilteredBySpecies = birdDataFilteredByDate.filter(obj => {
        if (filterName === "All Species") {
            return true;
        }
        if (filterName === obj.commonname) {
            return true;
        }
        return false;
    });

    markersNested = nestMarkers(birdDataFilteredBySpecies);

    console.log("markersNested", markersNested);

    markers.forEach((marker) => {
        marker.map = null;
    });
    markers.length = 0;

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
            <b>Date Reported:</b> ${dayjs(bird.datereported).format("YYYY-MM-DD HH:mm:ss")} <b>Reported By:</b> ${bird.reportedby}<br>
            <b>Location:</b> ${bird.locationname}<br>
            <b>Checklist:</b> <a href="${bird.checklistlink}">${bird.checklistlink}</a></p>`;
        }
        contentString += `</div>`;

        // console.log("contentString", contentString);

        const pin = new PinElement({
            // Blue
            // background: "#4B90F5",
            // borderColor: "#1965C4",
            // glyphColor: "#1965C4",
            // Orange
            background: "#FCC401",
            borderColor: "#ED9100",
            glyphColor: "#ED9100",
        });

        const markerOptions = {
            map: map,
            position: { lat: birdPos.lat1, lng: birdPos.lng1 },
            title: birdTitle
        };

        if (!(markersNested[indexA].length > 1)) {
            markerOptions.content = pin.element;
        }

        const marker = new AdvancedMarkerElement(markerOptions);

        marker.addListener("click", () => {
            infoWindow.close();
            infoWindow.setContent(contentString);
            // infoWindow.open(marker.map, marker);
            infoWindow.open({ anchor: marker, map });
        });

        markers.push(marker);

    }
    // });
}

function nestMarkers(birdData) {
    // let markersNested = [];
    let outputArray = [];
    outerLoop: for (let indexA = 0; indexA <= birdData.length - 1; indexA++) {
        const bird = birdData[indexA];
        if (indexA === 0) {
            outputArray.push([birdData[indexA]]);
            continue;
        }
        for (let indexB = 0; indexB <= outputArray.length - 1; indexB++) {
            const nestedMarker = outputArray[indexB][0];
            if (bird.lat1 === nestedMarker.lat1 && bird.lng1 === nestedMarker.lng1) {
                outputArray[indexB].push(birdData[indexA]);
                continue outerLoop;
            }
        }
        outputArray.push([birdData[indexA]]);
    }
    return outputArray;
}

function populateDropdown(birdData) {
    const dpdn = document.getElementById("example-search");

    let birdNames = birdData.map((bird) => {
        return bird.commonname;
    });

    let uniqueNames = birdNames.filter((value, index) => {
        return birdNames.indexOf(value) === index;
    });

    uniqueNames.sort((a, b) => a.localeCompare(b));

    uniqueNames.forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        const textNode = document.createTextNode(name);
        opt.appendChild(textNode);
        dpdn.appendChild(opt);
    });
}

initMap();