const Swal  =require("sweetalert2");
function fail() {
    Swal.fire({
        title: "Faild!",
        icon: "error",
        text: "Something went wrong...",
        draggable: true,
        confirmButtonColor: "#ff4500",
    });
}

exports.fail = fail;
