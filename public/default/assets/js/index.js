$(document).ready(function() {
    $("#header_btnEnroll").on("click", function(e) {
        location.href = "/admin/adminEnrollTrainList";
    });
    $("#header_btnClass").on("click", function(e) {
        location.href = "/admin/trainClassList";
    });
    $("#header_btnStudent").on("click", function(e) {
        location.href = "/admin/schoolAreaList";
    });
    $("#header_btnFinancial").on("click", function(e) {
        location.href = "/admin/schoolAreaList";
    });
    $("#header_btnBasic").on("click", function(e) {
        location.href = "/admin/schoolAreaList";
    });
});