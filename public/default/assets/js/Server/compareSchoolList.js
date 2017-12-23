var isNew = true;

$(document).ready(function () {
    $("#left_btnCompareSchool").addClass("active");
});

//------------search funfunction

var $mainSelectBody = $('.content.mainModal table tbody');

function search(p) {
    var filter = {
            name: $.trim($(".mainModal #InfoSearch #className").val()),
            schoolId: $(".mainModal #InfoSearch #searchSchool").val(),
            gradeId: $(".mainModal #InfoSearch #searchGrade").val(),
            subjectId: $(".mainModal #InfoSearch #searchSubject").val(),
            categoryId: $(".mainModal #InfoSearch #searchCategory").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/compareLastList/search?" + pStr, filter, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (schoolReport) {
                var $tr = $('<tr ><td>' + schoolReport.name + '</td><td>' +
                    schoolReport.gradeName + '</td><td>' +
                    schoolReport.teacherName + '</td><td>' +
                    schoolReport.originalCount + '</td><td>' +
                    schoolReport.enrollCount + '</td><td>' +
                    schoolReport.enrollRatio + '%</td></tr>');
                $mainSelectBody.append($tr);
            });
        }
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
    search();
});
//------------end