var isNew = true;

$(document).ready(function() {
    $("#left_btnCompareLast").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    renderSearchSchoolDropDown();
    renderSearchGradeDropDown();
    renderSearchSubjectDropDown();
});

//------------search funfunction
function renderSearchSchoolDropDown() {
    $.get("/admin/schoolArea/all", function(data) {
        if (data && data.length > 0) {
            data.forEach(function(school) {
                $(".mainModal #InfoSearch #searchSchool").append("<option value='" + school._id + "'>" + school.name + "</option>");
            });
        };
    });
};

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

function renderSearchSubjectDropDown() {
    $(".mainModal #InfoSearch #searchSubject").append("<option value=''></option>");
    $.get("/admin/subject/getAllWithoutPage", function(data) {
        if (data && data.length > 0) {
            data.forEach(function(subject) {
                $(".mainModal #InfoSearch #searchSubject").append("<option value='" + subject._id + "'>" + subject.name + "</option>");
            });
        };
    });
};

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
    selfAjax("post", "/admin/compareLastList/search?" + pStr, filter, function(data) {
        if (data && data.length > 0) {
            data.forEach(function(schoolReport) {
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

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    search();
});
//------------end