$.ajaxSetup({ // avoid array being populated asynchronously
    async: false
});

function desctivateButton(infoButton) {
    infoButton.css("background", "white");
    infoButton.css("color", "black");
}

function activateButton(infoButton) {
    infoButton.css("background", "black");
    infoButton.css("color", "white");
}

function hideBox(box, callback=null) {
    box.animate({
        bottom: (box.height()*-1)-100
    }, 500, function () {
        // Animation complete.
        box.hide();
        if (callback !== null) {
            callback();
        }
    });
}

function showBox(box) {
    box.show();
    box.animate({
        bottom: 75
    }, 500, function () {
        // Animation complete.
    });
}

function revealAllImages() {
    $.each(imagesList, (index, image) => {
        image.setOpacity(1);
    })
}

async function showKunstnerContent() {
    $(".kunstner-back").hide();
    $(".kunstner-info").hide();
    $(".kunst-content").show();
    $(".kunstner-back-no-link").show();
}

let mobile = false;
function mobileSettins() {
    if(window.matchMedia("(max-width: 767px)").matches){
        mobile = true;
        // mobile
        $(".info-box").css("width", "calc(100vw - 30px)");
        $(".kunst-box").css("width", "calc(100vw - 30px)");
        $(".info-box").css("height", "calc(100vh - 200px)");
        $(".kunst-box").css("height", "calc(100vh - 200px)");

        $(".info-content").css("height", "calc(100vh - 337px)");
        $(".kunst-content").css("height", "calc(100vh - 292px)");
        $(".kunstner-info").css("height", "calc(100vh - 292px)");

        $(".info-box").css("left", "50%");
        $(".info-box").css("transform", "translateX(-50%)");
        $(".kunst-box").css("left", "50%");
        $(".kunst-box").css("transform", "translateX(-50%)");
        $(".menu").css("left", "50%");
        $(".menu").css("transform", "translateX(-50%)");
        $(".fase-intro-title").css("font-size", "150px");
        $(".fase-intro-title").css("margin-bottom", "-40px");
        $(".info-box").css("padding", "15px");
        $(".kunst-box").css("padding", "15px");

        $(".kunst-box-artist-mobile").css("padding", "0px 5px 5px 15px;");
        $(".kunst-box-artist-mobile").css("transform", "translateX(-50%)");
        $(".kunst-box-artist-mobile").css("left", "50%");
        $(".kunst-box-artist-mobile").css("width", "calc(100vw - 30px)");
        $(".kunst-box-artist-mobile").hide();

        $(".xClose").css("position", "absolute");
        $(".xClose").css("right", "5px");

        $(".menu-button").css("width", "100px");

    } else{
        mobile = false;
        $(".info-box").css("height", "calc(100vh - 100px)");
        $(".kunst-box").css("height", "calc(100vh - 100px)");
        $(".info-box").css("right", "36px");
        $(".kunst-box").css("right", "36px");
        $(".kunst-box").css("width", "30%");
        $(".info-box").css("width", "30%");

        $(".info-content").css("height", "calc(100vh - 237px)");
        $(".kunst-content").css("height", "calc(100vh - 192px)");
        $(".kunstner-info").css("height", "calc(100vh - 192px)");

        $(".menu").css("right", "50px");
        $(".fase-intro-title").css("font-size", "300px");
        $(".fase-intro-title").css("margin-bottom", "-70px");
        $(".info-box").css("padding", "30px");
        $(".kunst-box").css("padding", "30px");

        $(".kunst-box-artist-mobile").hide();

        $(".xClose").css("position", "absolute");
        $(".xClose").css("right", "30px");

        $(".menu-button").css("width", "116px");

    }
}

function kunstBoxCloseCallback(kunstnerInfo, kunstContent, kunstnerBackButton, $kunstnere, kunstnerBackButtonNoLink) {
    // kunstnerInfo.hide();
    // kunstContent.show();
    kunstnerBackButton.hide();
    $kunstnere.removeClass("col-8");
    $kunstnere.addClass("col-10");
    $kunstnere.css("margin-left", "0px");
    $kunstnere.css("margin-right", "0px");
    kunstnerBackButtonNoLink.show();
}

function populateInfo(artistBioElement, $kunstnerName, content) {
    if (content !== null && content !== "") {
        $kunstnerName.show();
        $kunstnerName.html(content);
    } else {
        $kunstnerName.hide();
    }
}

let infoButton = $(".info-button");
let kunstButton = $(".kunst-button");
let kunstnerBackButton = $(".kunstner-back");
let kunstnerBackButtonNoLink = $(".kunstner-back-no-link");
let kunstnerInfo = $(".kunstner-info");
let kunstContent = $(".kunst-content");
let infoBox = $(".info-box");
let kunstBox = $(".kunst-box");
let kunstBoxArtistMobile = $(".kunst-box-artist-mobile");
let infoNo = $(".info-no");
let infoEn = $(".info-en");
let langNo = $(".lang-no");
let langEn = $(".lang-en");
let $kunstnere = $(".kunstnere-header");

let artistBio = null;

$.getJSON("artist-about.json", function (data) {
    artistBio = data;
});

$(document).ready(()=> {

    mobileSettins();

    let map = null;
    initializeCanvas(null).then((localMap) => {
        map = localMap.mymap;
        map.setZoom(5);
    });

    // setTimeout(() => {
    //     $(".overlay").fadeOut(() => {
    //         map.setZoom(6);
    //     });
    // }, 10000);

    $(".overlay").click(() => {
        $(".overlay").animate({
            opacity: "0"
        }, 700, function () {
            map.setZoom(6);
            $(".overlay").fadeOut();
        });
    });

    $(".kunst-box-artist-mobile-link").click(() => {
        kunstnerInfo.show();
        showBox(kunstBox);
        kunstnerBackButton.show();
        kunstnerBackButtonNoLink.hide();
        $kunstnere.removeClass("col-10");
        $kunstnere.addClass("col-8");
        $kunstnere.css("margin-left", "-30px");
        $kunstnere.css("margin-right", "30px");
    });

    infoButton.click(() => {
        showBox(infoBox);
        hideBox(kunstBox, ()=> {
            kunstBoxCloseCallback(kunstnerInfo, kunstContent, kunstnerBackButton, $kunstnere, kunstnerBackButtonNoLink);
            revealAllImages();
        });

        activateButton(infoButton);
        desctivateButton(kunstButton);
    });

    $(".info-close").click(() => {
        hideBox(infoBox);
        desctivateButton(infoButton);
    });

    $(".kunst-close").click(() => {
        if (mobile) {
            showBox(kunstBoxArtistMobile);
        }
        hideBox(kunstBox, ()=> {
            kunstBoxCloseCallback(kunstnerInfo, kunstContent, kunstnerBackButton, $kunstnere, kunstnerBackButtonNoLink);
            if(!mobile) {
                revealAllImages();
            }
        });
        desctivateButton(kunstButton);
    });

    $(".kunst-close-mobile").click(() => {
        hideBox(kunstBoxArtistMobile, ()=> {
            revealAllImages();
        });
        desctivateButton(kunstButton);
    });

    langNo.click(() => {
        infoNo.show();
        infoEn.hide();
        langEn.css("font-weight", "normal");
        langEn.css("text-decoration", "none");
        langNo.css("font-weight", "bold");
        langNo.css("text-decoration", "underline");
    });


    langEn.click(() => {
        infoEn.show();
        infoNo.hide();
        langNo.css("font-weight", "normal");
        langNo.css("text-decoration", "none");
        langEn.css("font-weight", "bold");
        langEn.css("text-decoration", "underline");
    });

    kunstButton.click(() => {
        kunstnerInfo.hide();
        kunstContent.show();
        
        $kunstnere.removeClass("col-8");
        $kunstnere.addClass("col-10");
        $kunstnere.css("margin-left", "0px");
        $kunstnere.css("margin-right", "0px");
        kunstnerBackButton.hide();
        kunstnerBackButtonNoLink.show();

        showBox(kunstBox);
        hideBox(infoBox);

        activateButton(kunstButton);
        desctivateButton(infoButton);
    });

    $(".kunstner-back").click(() => {
        showKunstnerContent();
        $kunstnere.removeClass("col-8");
        $kunstnere.addClass("col-10");
        $kunstnere.css("margin-left", "0px");
        $kunstnere.css("margin-right", "0px");
        map.remove();
        initializeCanvas(null).then((localMap)=>{
            map = localMap.mymap;
        });
    });


    shuffle(artistNames);

    $.each(artistNames, (index, name) => {
        $(".kunst-content").append(`<div class="row">
                                        <a href="#"><div class="col-sm ${name}">${artistBio[name].name}</div></a>
                                        </div>`);
        $(`.${name}`).click(() => {
            kunstnerBackButton.show();
            kunstnerBackButtonNoLink.hide();
            $kunstnere.removeClass("col-10");
            $kunstnere.addClass("col-8");
            $kunstnere.css("margin-left", "-30px");
            $kunstnere.css("margin-right", "30px");

            kunstContent.hide();
            kunstnerInfo.show();
            // console.log(artistBio[name]);
            let artistBioElement = artistBio[name];
            let $kunstnerName = $(".kunstner-info .kunstern-name");
            let $kunstnerProject = $(".kunstner-info .project-name");
            let $kunstnerStedTid = $(".kunstner-info .stedtid");
            let $kunstnerProjectDesc = $(".kunstner-info .project-description");
            let $kunstnerBio = $(".kunstner-info .kunstner-bio");

            populateInfo(artistBioElement, $kunstnerName, artistBioElement.name);
            populateInfo(artistBioElement, $kunstnerProject, artistBioElement.title);
            populateInfo(artistBioElement, $kunstnerStedTid, artistBioElement.stedtid);
            populateInfo(artistBioElement, $kunstnerProjectDesc, artistBioElement.text);
            populateInfo(artistBioElement, $kunstnerBio, artistBioElement.bio);

            $(".kunst-box-artist-mobile .kunstnere-header b").html(artistBioElement.name);


            map.remove();
            initializeCanvas(`${name}`).then((localMap)=>{
                map = localMap.mymap;
                // console.log(localMap.imagesList);
                // console.log("cented on:");
                // console.log(localMap.imagesList[1]);
                // map.setView(localMap.imagesList[1].getBounds().getCenter(), 6);
            });
        });
    });

});
