const $ = require("jquery");

function createEditorDialog() {
    let dialog;
    let confirm;
    return {
        getPopup: () => dialog,
        getConfirmButton: () => confirm,
        fire(options) {
            return new Promise(resolve => {
                dialog = document.createElement("dialog");
                dialog.className = "songs-editor-dialog";
                const heading = document.createElement("h2");
                heading.id = "songs-editor-title";
                heading.textContent = options.title;
                dialog.setAttribute("aria-labelledby", heading.id);
                dialog.append(heading);
                if (options.html) $(dialog).append(options.html);
                if (options.text) {
                    const text = document.createElement("p");
                    text.textContent = options.text;
                    dialog.append(text);
                }
                const actions = document.createElement("div");
                actions.className = "songs-editor-actions";
                confirm = document.createElement("button");
                confirm.type = "button";
                confirm.className = "btn btn-orange";
                confirm.textContent = options.confirmButtonText;
                actions.append(confirm);
                let cancel;
                if (options.showCancelButton !== false) {
                    cancel = document.createElement("button");
                    cancel.type = "button";
                    cancel.className = "btn btn-secondary";
                    cancel.textContent = options.cancelButtonText;
                    actions.append(cancel);
                }
                dialog.append(actions);
                let finished = false;
                const finish = isConfirmed => {
                    if (finished) return;
                    finished = true;
                    options.willClose?.();
                    dialog.close();
                    dialog.remove();
                    resolve({ isConfirmed });
                };
                confirm.addEventListener("click", () => { if (!confirm.disabled) finish(true); });
                cancel?.addEventListener("click", () => finish(false));
                dialog.addEventListener("cancel", event => { event.preventDefault(); finish(false); });
                // Keep Escape inside the editor instead of closing the player.
                dialog.addEventListener("keydown", event => event.stopPropagation());
                document.body.append(dialog);
                dialog.showModal();
                options.didOpen?.();
            });
        },
    };
}

exports.createEditorDialog = createEditorDialog;
