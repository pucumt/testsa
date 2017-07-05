$(document).ready(function() {
    $("#left_btnRollCall").on("click", function(e) {
        location.href = "/admin/adminRollCallList";
    });

    $("#left_btnRollCallClass").on("click", function(e) {
        location.href = "/admin/adminRollCallClassList";
    });
});