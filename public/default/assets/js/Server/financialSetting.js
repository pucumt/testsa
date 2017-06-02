$(document).ready(function() {
    $("#left_btnSchoolReport").on("click", function(e) {
        location.href = "/admin/schoolReportList";
    });

    $("#left_btnPayWayReport").on("click", function(e) {
        location.href = "/admin/payWayReportList";
    });

    $("#left_btnRebateReport").on("click", function(e) {
        location.href = "/admin/rebateReportList";
    });

    $("#left_btnPeopleCount").on("click", function(e) {
        location.href = "/admin/peopleCountList";
    });

    $("#left_btngradeMone").on("click", function(e) {
        location.href = "/admin/gradeMOneList";
    });

    $("#left_btnCompareLast").on("click", function(e) {
        location.href = "/admin/compareLastList";
    });
});