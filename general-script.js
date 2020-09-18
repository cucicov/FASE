function desctivateButton(infoButton) {
    infoButton.css("background", "white");
    infoButton.css("color", "black");
}

function activateButton(infoButton) {
    infoButton.css("background", "black");
    infoButton.css("color", "white");
}

function hideBox(box) {
    box.animate({
        bottom: (box.height()*-1)-100
    }, 500, function () {
        // Animation complete.
    });
}

function showBox(box) {
    box.animate({
        bottom: 60
    }, 500, function () {
        // Animation complete.
    });
}

$(document).ready(()=> {
    let map = initializeCanvas(null);

    $(".overlay").delay(2000).fadeOut(() => {
        map.setZoom(5);
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
        hideBox(kunstBox);
        desctivateButton(kunstButton);
    });

    $(".lang-no").click(() => {
        infoNo.show();
        infoEn.hide();
    });


    $(".lang-en").click(() => {
        infoEn.show();
        infoNo.hide();
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
        kunstnerBackButton.hide();
        kunstnerInfo.hide();
        kunstContent.show();
        map.remove();
        map = initializeCanvas(null);
    });

    $.each(artistNames, (index, name) => {
        $(".kunst-content").append(`<div class="row">
                                        <a href="#"><div class="col-sm ${name}">${name}</div></a>
                                        </div>`);
        $(`.${name}`).click(() => {
            map.remove();
            map = initializeCanvas(`${name}`);
            kunstnerBackButton.show();
            kunstContent.hide();
            kunstnerInfo.show();
            // console.log(artistBio[name]);
            $(".kunstner-info .kunstern-name").html(artistBio[name].name);
            $(".kunstner-info .project-name").html(artistBio[name].title);
            $(".kunstner-info .stedtid").html(artistBio[name].stedtid);
            $(".kunstner-info .project-description").html(artistBio[name].text);
            $(".kunstner-info .kunstner-bio").html(artistBio[name].bio);
        });
    });

});
