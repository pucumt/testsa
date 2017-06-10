var isNew = true;

$(document).ready(function() {
    $("#left_btnEnrollAggregate").addClass("active");
    renderSearchGradeDropDown();
});

//------------search funfunction
function renderSearchGradeDropDown() {
    $(".mainModal #InfoSearch #searchGrade").append("<option value=''></option>");
    $.get("/admin/grade/getAll", function(data) {
        if (data && data.length > 0) {
            data.forEach(function(grade) {
                $(".mainModal #InfoSearch #searchGrade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
            });
        };
    });
};

var $mainSelectBody = $('.content.mainModal table tbody');
$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    $mainSelectBody.empty();
    selfAjax("post", "/admin/enrollAggregateList/search", {
        gradeId: $(".mainModal #InfoSearch #searchGrade").val()
    }, function(data) {
        if (data && data.length > 0) {
            data.forEach(function(schoolReport) {
                var $tr = $('<tr><td class="trainClass" >' + schoolReport.name + '</td><td>' +
                    schoolReport.value + '</td></tr>');
                $mainSelectBody.append($tr);
            });
        }
    });
});
//------------end