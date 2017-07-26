$(document).ready(function() {
    $("#left_btnAccount").on("click", function(e) {
        location.href = "/admin/studentAccountList";
    });

    $("#left_btnStudent").on("click", function(e) {
        location.href = "/admin/studentsList";
    });

    $("#left_btnCard").on("click", function(e) {
        location.href = "/admin/cardSearch";
    });

    $("#left_btnScoreInput").on("click", function(e) {
        location.href = "/admin/ScoreInput";
    });

    $("#left_btnCoupon").on("click", function(e) {
        location.href = "/admin/couponList";
    });

    $("#left_btnUpgrade").on("click", function(e) {
        location.href = "/admin/upgradeList";
    });
});