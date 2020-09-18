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
        bottom: 60
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
}

$(document).ready(()=> {
    let map = null;
    initializeCanvas(null).then((localMap) => {
        map = localMap;
        map.setZoom(5);
    });

    $(".overlay").delay(2000).fadeOut(() => {
        map.setZoom(6);
    });

    let artistBio = null;

    let infoButton = $(".info-button");
    let kunstButton = $(".kunst-button");
    let kunstnerBackButton = $(".kunstner-back");
    let kunstnerInfo = $(".kunstner-info");
    let kunstContent = $(".kunst-content");
    let infoBox = $(".info-box");
    let kunstBox = $(".kunst-box");
    let infoNo = $(".info-no");
    let infoEn = $(".info-en");
    let langNo = $(".lang-no");
    let langEn = $(".lang-en");

    infoButton.click(() => {
        showBox(infoBox);
        hideBox(kunstBox);

        activateButton(infoButton);
        desctivateButton(kunstButton);
    });

    $(".info-close").click(() => {
        hideBox(infoBox);
        desctivateButton(infoButton);
    });

    $(".kunst-close").click(() => {
        hideBox(kunstBox, ()=> {
            kunstnerInfo.hide();
            kunstContent.show();
        });
        desctivateButton(kunstButton);
        revealAllImages();
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
        showBox(kunstBox);
        hideBox(infoBox);

        activateButton(kunstButton);
        desctivateButton(infoButton);
    });

    $.getJSON("artist-about.json", function (data) {
        artistBio = data;
    });

    kunstnerBackButton.click(() => {
        showKunstnerContent();
        map.remove();
        initializeCanvas(null).then((localMap)=>{
            map = localMap;
        });
    });

    $.each(artistNames, (index, name) => {
        $(".kunst-content").append(`<div class="row">
                                        <a href="#"><div class="col-sm ${name}">${artistBio[name].name}</div></a>
                                        </div>`);
        $(`.${name}`).click(() => {
            kunstnerBackButton.show();
            kunstContent.hide();
            kunstnerInfo.show();
            // console.log(artistBio[name]);
            $(".kunstner-info .kunstern-name").html(artistBio[name].name);
            $(".kunstner-info .project-name").html(artistBio[name].title);
            $(".kunstner-info .stedtid").html(artistBio[name].stedtid);
            $(".kunstner-info .project-description").html(artistBio[name].text);
            $(".kunstner-info .kunstner-bio").html(artistBio[name].bio);

            map.remove();
            initializeCanvas(`${name}`).then((localMap)=>{
                map = localMap;
                map.setView(imagesList[1].getBounds().getCenter(), 6);
            });
        });
    });

});
