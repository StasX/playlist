const Swal = require("sweetalert2");

function success(msg) {
    Swal.fire({
        title: msg,
        icon: "success",
        draggable: true,
        confirmButtonColor: "#ff4500",
    });
}

exports.success = success;
