$(document).ready(function () {
    $("#left_btnPeopleCount").on("click", function (e) {
        location.href = "/Teacher/peopleCountList";
    });

    $(".admin-header .menu-top #header_btnFinancial").addClass("active");
});