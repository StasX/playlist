"use strict";
exports.getPath = function (url) {// get url
var lc = location; 
//project will work in any directory in document root 
return lc.protocol + "\/\/" + lc.host + lc.pathname.substr(0, lc.pathname.lastIndexOf("/") + 1) + url; 
}
exports.len = function (s) {//get length;
return s.length; 
}
exports.findParentPos = function (elem, children, deep) { //returning element parents position in element
    var arr = Array.prototype.slice.call(children);
    switch(deep){
        case 1 : {
            return arr.indexOf(elem.parentElement);
        }   case 2 : {
            return arr.indexOf(elem.parentElement.parentElement);
        }   case 3 : {
            return arr.indexOf(elem.parentElement.parentElement.parentElement);
        }
    }
}
