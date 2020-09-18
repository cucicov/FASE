const MAP_PAN_MARGIN = 20;

let viewFocusX = 0.0;
let viewFocusY = 20.0;

let latLimit = [0, 0];
let lonLimit = [0, 0];

let artistNames = [];
let imagesList = [];

function initializeCanvas(selectedArtistName) {
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

    populatePanel(uniqueImagesPanel, restAllImages, selectedArtistName, imagesList, mymap);

    mymap.setZoom(6);

    console.log("View Focus: X=" + viewFocusX + " Y=" + viewFocusY);

    shuffle(artistNames);

    return mymap;
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

function insertFinalImages(restAllImages, direction, toggleDirection, opacity, imagesList, mymap) {
    // let counter = 0;
    // while (counter < )
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
    return {direction, toggleDirection};
}

function populatePanel(uniqueImagesPanel, restAllImages, selectedArtistName, imagesList, mymap) {
    let direction = 2; // starting direction right
    let toggleDirection = 1; // switch between adding to the right and adding to the left

    let customOpacity = (selectedArtistName === null || selectedArtistName === undefined) ? 1 : 0.2;
    insertFinalImages(uniqueImagesPanel, direction, toggleDirection, 1, imagesList, mymap);
    insertFinalImages(restAllImages, direction, toggleDirection, customOpacity, imagesList, mymap);

    mymap.setView([viewFocusX, viewFocusY], 8)
}

function getImageData(imagePath) {
    let imageName = imagePath.split('/')[2]; // get image name only from format images/adaMiko/1_000_000.jpg
    let imageWidth = imageName.split('_')[2];
    let imageHeight = imageName.split('_')[3].split('.')[0];
    return {
        "name": imageName,
        "width": imageWidth,
        "height": imageHeight
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
        return L.imageOverlay(imagePath, imageBounds).addTo(mymap);
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
    let newImage = L.imageOverlay(imagePath, imageBounds, {opacity: opacity}).addTo(mymap);

    let margin = getRandomInt(20, 80); // expressed in lat log. 1 unit = 2px; //TODO: configurable

    let variableOriginDifference = 0;
    while (overlay || margin > 0) {
        if (direction > 0) {
            variableOrigin += 0.01;
            variableOriginDifference += 0.01;
        } else {
            variableOrigin -= 0.01;
            variableOriginDifference -= 0.01;
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
        imagesList.forEach((localImage) => {
            notIntersection = notIntersection && !localImage.getBounds().intersects(newImage.getBounds());
        });

        overlay = !notIntersection;
        if (!overlay) {
            margin = margin - 1;
        }
    }

    calculateMapLimits(imageBounds);

    return newImage;
}
