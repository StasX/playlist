function validHttpUrl(value) {
    if (typeof value !== "string" || !/^https?:\/\//i.test(value) || /\s/.test(value)) return false;
    try {
        const url = new URL(value);
        return (url.protocol === "http:" || url.protocol === "https:") && url.hostname !== "";
    } catch {
        return false;
    }
}

exports.validHttpUrl = validHttpUrl;
