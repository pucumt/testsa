$(document).ready(function () {
    $("#left_btnBook").on("click", function (e) {
        location.href = "/admin/adminBookList";
    });

    $(".admin-header .menu-top #header_btnBook").addClass("active");
});