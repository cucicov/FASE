const MAP_PAN_MARGIN = 4;

let viewFocusX = 0.0;
let viewFocusY = 20.0;

let latLimit = [0, 0];
let lonLimit = [0, 0];

let artistNames = [];
let imagesList = [];

async function initializeCanvas(selectedArtistName) {
    imagesList = [];
    viewFocusX = 0.0;
    viewFocusY = 20.0;
    latLimit = [0, 0];
    lonLimit = [0, 0];

    $.ajaxSetup({ // avoid array being populated asynchronously
        async: false
    });

    let mymap = L.map('mapid', {
        attributionControl: false,
        zoomControl: false,
        minZoom: 5,
        maxZoom: 8,
        maxBoundsViscosity: 1
    }).setView([0.0, 0.0], 8);

    mymap.on('drag', function() {
        mymap.setMaxBounds(L.latLngBounds(latLimit, lonLimit));
    });

    var uniqueImagesPanel = [];
    var restAllImages = [];


    // FIRST PAGE POPULATE LISTS.
    if (selectedArtistName === undefined || selectedArtistName === null) {
        $.getJSON("images/artist-index.json", function (data) {
            $.each(data, function (artistName, imageArray) {
                // get random image from each artist for starting panel
                artistNames.push(artistName);
                let imageFullPath = getImageFullPath(artistName, getRandomElement(imageArray));
                uniqueImagesPanel.push(imageFullPath);
                $.each(imageArray, function (index, imageName) {
                    let imageFullPath = getImageFullPath(artistName, imageName);
                    if (!uniqueImagesPanel.includes(imageFullPath)) { // add the rest of the images to be added in a
                        restAllImages.push(imageFullPath);
                    }
                });
            });
        });
    } else {

    // ARTIST PAGE POPULATE LISTS.
    // let selectedArtistName = "TuvaRasmussen";
        $.getJSON("images/artist-index.json", function (data) {
            $.each(data, function (artistName, imageArray) {
                // get random image from each artist for starting panel
                let imageFullPath = getImageFullPath(artistName, getRandomElement(imageArray));
                if (artistName === selectedArtistName) {
                    $.each(imageArray, (id, img) => {
                        uniqueImagesPanel.push(getImageFullPath(artistName, img));
                    });
                } else {
                    $.each(imageArray, function (id, img) {
                        let imageFullPath = getImageFullPath(artistName, img);
                        restAllImages.push(imageFullPath);
                    });
                }
            });
        });
    }

    uniqueImagesPanel = shuffle(uniqueImagesPanel);
    restAllImages = shuffle(restAllImages);

    populatePanel(uniqueImagesPanel, restAllImages, selectedArtistName, imagesList, mymap).then(()=>{
        mymap.setZoom(6);
    });

    return {mymap, imagesList};
}

function getRandomElement(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function getImageFullPath(artistName, imageName) {
    return "images/" + artistName + "/" + imageName;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function getNextDirection(direction) {
    if (direction === 1) {
        direction = -2;
    } else if (direction === -1) {
        direction = 2;
    } else if (direction === 2) {
        direction = 1;
    } else if (direction === -2) {
        direction = -1;
    }
    return direction;
}

function calculateNextDirectionAndViewFocus(toggleDirection, direction) {
    toggleDirection *= -1;

    direction = getNextDirection(direction);

    if (direction === 1) {
        viewFocusX -= 2;
    } else if (direction === -1) {
        viewFocusX += 2;
    } else if (direction === 2) {
        viewFocusY += 2;
    } else if (direction === -2) {
        viewFocusY -= 2;
    }
    return {toggleDirection, direction};
}

async function insertFinalImages(restAllImages, direction, toggleDirection, opacity, imagesList, mymap) {
    // $.ajaxSetup({ // avoid array being populated asynchronously
    //     async: true
    // });
    $.each(restAllImages, (index, imageFullPath) => {
        let imageData = getImageData(imageFullPath);
        let parent = imagesList[imagesList.length - 1]; //get last image added as parent for the next image.

        imagesList.push(
            addImage(imageFullPath, direction, parent, imageData.width,
                imageData.height, toggleDirection, opacity, mymap, imagesList));

        const __ret = calculateNextDirectionAndViewFocus(toggleDirection, direction);
        toggleDirection = __ret.toggleDirection;
        direction = __ret.direction;
    });
    return {direction, toggleDirection, imagesList, mymap};
}

async function populatePanel(uniqueImagesPanel, restAllImages, selectedArtistName, imagesList, mymap) {
    let direction = 2; // starting direction right
    let toggleDirection = 1; // switch between adding to the right and adding to the left

    let customOpacity = (selectedArtistName === null || selectedArtistName === undefined) ? 1 : 0.2;
    insertFinalImages(uniqueImagesPanel, direction, toggleDirection, 1, imagesList, mymap)
        .then((ret)=> {
        insertFinalImages(restAllImages, ret.direction, ret.toggleDirection, customOpacity, ret.imagesList, ret.mymap);
    });

    if (selectedArtistName === null || selectedArtistName === undefined) {
        mymap.flyTo([viewFocusX, viewFocusY], 8, {
            "animate": true,
            "duration": 0.9
        });
    } else {
        // manual offset to center the images of each artist.
        mymap.setView([imagesList[1].getBounds().getCenter().lat - 5, imagesList[1].getBounds().getCenter().lng + 2], 8);
    }
}

function getImageData(imagePath) {
    let imageName = imagePath.split('/')[2]; // get image name only from format images/adaMiko/1_000_000.jpg
    let artistId = imageName.split('_')[0];
    let imageWidth = imageName.split('_')[2];
    let imageHeight = imageName.split('_')[3].split('.')[0];
    return {
        "name": imageName,
        "width": imageWidth,
        "height": imageHeight,
        "artistId": artistId
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateImageBounds(variableOriginX, variableOriginY, imageWidth, imageHeight, mymap) {
    let originPoint = mymap.latLngToContainerPoint([variableOriginX, variableOriginY]);
    let nextCornerPoint = originPoint.add({x: parseInt(imageWidth), y: parseInt(imageHeight) * -1});
    let nextCornerLatLng = mymap.containerPointToLatLng(nextCornerPoint);
    return [[variableOriginX, variableOriginY], nextCornerLatLng];
}

function calculateMapLimits(imageBounds) {
    let imgLat = imageBounds[0];
    let imgLon = imageBounds[1];
    if (latLimit[0] > imgLat[0]) {
        latLimit[0] = imgLat[0] - MAP_PAN_MARGIN;
    }
    if (latLimit[1] > imgLat[1]) {
        latLimit[1] = imgLat[1] - MAP_PAN_MARGIN;
    }
    if (lonLimit[0] < imgLon.lat) {
        lonLimit[0] = imgLon.lat + MAP_PAN_MARGIN;
    }
    if (lonLimit[1] < imgLon.lng) {
        lonLimit[1] = imgLon.lng + MAP_PAN_MARGIN;
    }
}

async function moveImage(overlay, margin, direction, variableOrigin, variableOriginDifference, variableOriginY, variableOriginX, imageBounds, imageWidth, imageHeight, mymap, newImage, imagesList) {
    let step = 0.3;
    while (overlay || margin > 0) {
        // if (step >= 0.02) { // simulate decreasing step in moving images to offload processing.
        //     step -= 0.01;
        // }
        if (direction > 0) {
            variableOrigin += step;
            variableOriginDifference += step;
        } else {
            variableOrigin -= step;
            variableOriginDifference -= step;
        }
        if (direction % 2 === 0) {
            variableOriginY = variableOrigin;
        } else {
            variableOriginX = variableOrigin;
        }

        imageBounds = calculateImageBounds(variableOriginX, variableOriginY, imageWidth, imageHeight, mymap);
        newImage.setBounds(imageBounds);

        // mechanism to avoid too stretched cloud formations.
        if (Math.abs(variableOriginDifference) > 50) {
            direction = getNextDirection(direction) * -1;
            variableOriginDifference = 0;
            variableOrigin = variableOrigin / 4;
        }

        // mechanism to simulate break. once an overlay is detected -> move the image and check again.
        let notIntersection = true;
        $.each(imagesList, (index, localImage) => {
            notIntersection = notIntersection && !localImage.getBounds().intersects(newImage.getBounds());
            if (!notIntersection) {
                return false;
            }
        });

        overlay = !notIntersection;
        if (!overlay) {
            step = 0.01;
            margin = margin - 1;
        }
    }
    return {direction, variableOriginY, variableOriginX, imageBounds};
}

function getArtistBio(artistId) {
    let fullArtistId = null;
    if (artistId === "AM") {
        return artistBio["AdaMiko"];
    } if (artistId === "AT") {
        return artistBio["AmalieTrones"];
    } if (artistId === "AY") {
        return artistBio["AndreasTystad"];
    } if (artistId === "AE") {
        return artistBio["AnnaMelbye"];
    } if (artistId === "CL") {
        return artistBio["CamillaLouadah"];
    } if (artistId === "DR") {
        return artistBio["DanielRognskog"];
    } if (artistId === "EM") {
        return artistBio["EmilyMcLean"];
    } if (artistId === "FB") {
        return artistBio["FredrikBedsvaag"];
    } if (artistId === "OW") {
        return artistBio["OscarWarpe"];
    } if (artistId === "PB") {
        return artistBio["PalBringe"];
    } if (artistId === "SS") {
        return artistBio["SofieSvanes"];
    } if (artistId === "SL") {
        return artistBio["StefanLakselvhaug"];
    } if (artistId === "TS") {
        return artistBio["TanjaSilvestrini"];
    } if (artistId === "TH") {
        return artistBio["TimHereid"];
    } if (artistId === "TG") {
        return artistBio["TomGaustad"];
    } if (artistId === "TR") {
        return artistBio["TuvaRasmussen"];
    } if (artistId === "VL") {
        return artistBio["VeraLunde"];
    }
}

function addOnClickArtistInfoEvent(imagePath) {
    hideBox(infoBox);
    kunstnerBackButton.show();
    kunstnerBackButtonNoLink.hide();
    $kunstnere.removeClass("col-10");
    $kunstnere.addClass("col-8");
    $kunstnere.css("margin-left", "-30px");
    $kunstnere.css("margin-right", "30px");

    kunstContent.hide();
    kunstnerInfo.show();
    // console.log(artistBio[name]);

    let artistId = getImageData(imagePath).artistId;
    let artistBioImageLink = getArtistBio(artistId);
    let artistBioElement = artistBioImageLink;
    let $kunstnerName = $(".kunstner-info .kunstern-name");
    let $kunstnerProject = $(".kunstner-info .project-name");
    let $kunstnerStedTid = $(".kunstner-info .stedtid");
    let $kunstnerProjectDesc = $(".kunstner-info .project-description");
    let $kunstnerBio = $(".kunstner-info .kunstner-bio");

    //TODO: remove artistBioElement from method?
    populateInfo(artistBioElement, $kunstnerName, artistBioImageLink.name);
    populateInfo(artistBioElement, $kunstnerProject, artistBioImageLink.title);
    populateInfo(artistBioElement, $kunstnerStedTid, artistBioImageLink.stedtid);
    populateInfo(artistBioElement, $kunstnerProjectDesc, artistBioImageLink.text);
    populateInfo(artistBioElement, $kunstnerBio, artistBioImageLink.bio);

    showBox(kunstBox);
    $(".kunst-box-artist-mobile .kunstnere-header b").html(artistBioElement.name);
}

function addImage(imagePath, direction, parent, imageWidth, imageHeight, toggleDirection, opacity, mymap, imagesList) {
    // direction:
    // 1 = UP
    // -1 = DOWN
    // 2 = RIGHT
    // -2 = LEFT
    // console.log(imagePath + ":" + direction);
    let staticOriginX = 0;
    let staticOriginY = 0;
    if (parent === null || parent === undefined) { // this is the first image that has to be placed in the center
        let imageBounds = calculateImageBounds(staticOriginX, staticOriginY, imageWidth, imageHeight, mymap);
        return L.imageOverlay(imagePath, imageBounds, {opacity: opacity, interactive: true}).addTo(mymap).on('click', function(d) {
            addOnClickArtistInfoEvent(imagePath);
        });;
    }

    let overlay = true;
    if (toggleDirection === 1) {
        staticOriginX = parent.getBounds().getSouthWest()['lat'];
        staticOriginY = parent.getBounds().getSouthWest()['lng'];
    } else {
        staticOriginX = parent.getBounds().getCenter()['lat'];
        staticOriginY = parent.getBounds().getCenter()['lng'];
    }

    let variableOrigin;
    if (direction % 2 === 0) {
        variableOrigin = staticOriginY;
    } else {
        variableOrigin = staticOriginX;
    }

    let variableOriginY = staticOriginY;
    let variableOriginX = staticOriginX;

    let imageBounds = calculateImageBounds(variableOriginX, variableOriginY, imageWidth, imageHeight, mymap);
    let newImage = L.imageOverlay(imagePath, imageBounds, {opacity: opacity, interactive: true}).addTo(mymap)
        .on('click', function(d) {
            addOnClickArtistInfoEvent(imagePath);
        });

    let margin = getRandomInt(25, 40); // expressed in lat log. 1 unit = 2px; //TODO: configurable

    let variableOriginDifference = 0;
    moveImage(overlay, margin, direction, variableOrigin, variableOriginDifference,
        variableOriginY, variableOriginX, imageBounds, imageWidth,
        imageHeight, mymap, newImage, imagesList).then((__ret ) => {
        direction = __ret.direction;
        variableOriginY = __ret.variableOriginY;
        variableOriginX = __ret.variableOriginX;
        imageBounds = __ret.imageBounds;
        calculateMapLimits(imageBounds);
    });

    return newImage;
}
