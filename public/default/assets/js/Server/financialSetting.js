$(document).ready(function () {
    $("#left_btnSchoolReport").on("click", function (e) {
        location.href = "/admin/schoolReportList";
    });

    $("#left_btnPayWayReport").on("click", function (e) {
        location.href = "/admin/payWayReportList";
    });

    $("#left_btnRebateReport").on("click", function (e) {
        location.href = "/admin/rebateReportList";
    });

    $("#left_btnRebateDetail").on("click", function (e) {
        location.href = "/admin/rebateDetailList";
    });

    $("#left_btnChangeSchool").on("click", function (e) {
        location.href = "/admin/changeSchoolList";
    });

    $("#left_btnPeopleCount").on("click", function (e) {
        location.href = "/admin/peopleCountList";
    });

    $("#left_btngradeMone").on("click", function (e) {
        location.href = "/admin/gradeMOneList";
    });

    $("#left_btnCompareLast").on("click", function (e) {
        location.href = "/admin/compareLastList";
    });

    $("#left_btnCompareGrade").on("click", function (e) {
        location.href = "/admin/compareGradeList";
    });

    $("#left_btnCompareSchool").on("click", function (e) {
        location.href = "/admin/compareSchoolList";
    });

    $("#left_btnEnrollAggregate").on("click", function (e) {
        location.href = "/admin/enrollAggregateList";
    });

    $("#left_btnOtherReport").on("click", function (e) {
        location.href = "/admin/otherReportList";
    });

    $(".admin-header .menu-top #header_btnFinancial").addClass("active");
    $(".admin-header .menu-top #header_btnFinancial2").addClass("active");
});