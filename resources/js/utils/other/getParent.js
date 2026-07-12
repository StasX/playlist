exports.getParent = function getParent(element, depth) {
    if (!depth) return element;
    return (getParent(element.parent(), --depth));
}
