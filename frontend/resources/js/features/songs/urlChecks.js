function createUrlChecks(onChange) {
    const checks = new Map();
    let active = true;
    return {
        isVerified(url) {
            if (!active) return false;
            if (!checks.has(url)) {
                const audio = new Audio();
                const check = { valid: false, audio };
                checks.set(url, check);
                const finish = valid => {
                    clearTimeout(check.timer);
                    audio.onloadedmetadata = audio.onerror = null;
                    audio.removeAttribute("src");
                    audio.load();
                    if (!active) return;
                    check.valid = valid;
                    onChange();
                };
                audio.preload = "metadata";
                audio.onloadedmetadata = () => finish(true);
                audio.onerror = () => finish(false);
                check.timer = setTimeout(() => finish(false), 10000);
                audio.src = url;
                audio.load();
            }
            return checks.get(url).valid;
        },
        dispose() {
            active = false;
            for (const check of checks.values()) {
                clearTimeout(check.timer);
                check.audio.onloadedmetadata = check.audio.onerror = null;
                check.audio.removeAttribute("src");
                check.audio.load();
            }
        },
    };
}

exports.createUrlChecks = createUrlChecks;
