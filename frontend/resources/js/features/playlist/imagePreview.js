const { validHttpUrl } = require("../../utils/validators/url");

function setupImagePreview(popup, imgUrl) {
    const container = popup.find(".image-container");
    const image = container.find("img");
    const updatePreview = () => {
        const url = imgUrl.val().trim();
        if (validHttpUrl(url)) {
            image.attr("src", url);
            container.show();
        } else {
            image.removeAttr("src");
            container.hide();
        }
    };

    imgUrl.on("input", updatePreview);
    updatePreview();
}

exports.setupImagePreview = setupImagePreview;
