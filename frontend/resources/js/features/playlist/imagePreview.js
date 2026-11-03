const { validHttpUrl } = require("../../utils/validators/url");
const $ = require("jquery");
const { validatePlaylistForm } = require("../../utils/validators/playlistForm");

function setupImagePreview(popup, imgUrl, name, playlist, confirmBtn) {
    const container = popup.find(".image-container");
    const image = container.find("img");
    let request;
    let version = 0;
    let verified = false;
    const validate = () => validatePlaylistForm(name, imgUrl, playlist, confirmBtn, verified);
    const updatePreview = () => {
        const currentVersion = ++version;
        verified = false;
        validate();
        if (request) request.abort();
        image.off("load error").removeAttr("src");
        container.hide();
        const url = imgUrl.val().trim();
        if (validHttpUrl(url)) {
            request = $.get({ url, dataType: "text", timeout: 10000 })
                .done(() => {
                    if (currentVersion !== version) return;
                    image.on("load", () => {
                        if (currentVersion !== version) return;
                        verified = true;
                        container.show();
                        validate();
                    }).on("error", () => {
                        if (currentVersion !== version) return;
                        verified = false;
                        container.hide();
                        validate();
                    }).attr("src", url);
                });
        }
    };

    name.on("input", () => {
        name.data("edited", true);
        validate();
    });
    imgUrl.on("input", () => {
        imgUrl.data("edited", true);
        updatePreview();
    });
    updatePreview();
}

exports.setupImagePreview = setupImagePreview;
