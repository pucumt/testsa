var isNew = true;

$(document).ready(function () {
    $("#left_btnPeopleCount").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#startDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd"
    });
    $("#endDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd"
    });

    renderSearchSchoolDropDown();
    renderSearchGradeDropDown();
    renderSearchSubjectDropDown();
    renderSearchCategoryDropDown();
});

//------------search funfunction
function renderSearchSchoolDropDown() {
    selfAjax("get", "/Teacher/schoolArea/all", null)
        .then(function (data) {
            if (data && data.length > 0) {
                data.forEach(function (school) {
                    $(".mainModal #InfoSearch #searchSchool").append("<option value='" + school._id + "'>" + school.name + "</option>");
                });
            };
        });
};

function renderSearchGradeDropDown() {
    // $(".mainModal #InfoSearch #searchGrade").append("<option value=''></option>");
    selfAjax("get", "/Teacher/grade/getAll", null)
        .then(function (data) {
            if (data && data.length > 0) {
                data.forEach(function (grade) {
                    $(".mainModal #InfoSearch #searchGrade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
                });
            };
        });
};

function renderSearchSubjectDropDown() {
    $(".mainModal #InfoSearch #searchSubject").append("<option value=''></option>");
    selfAjax("get", "/Teacher/subject/getAllWithoutPage", null)
        .then(function (data) {
            if (data && data.length > 0) {
                data.forEach(function (subject) {
                    $(".mainModal #InfoSearch #searchSubject").append("<option value='" + subject._id + "'>" + subject.name + "</option>");
                });
            };
        });
};

function renderSearchCategoryDropDown() {
    $(".mainModal #InfoSearch #searchCategory").append("<option value=''></option>");
    selfAjax("get", "/Teacher/category/all", null)
        .then(function (data) {
            if (data && data.length > 0) {
                data.forEach(function (category) {
                    $(".mainModal #InfoSearch #searchCategory").append("<option value='" + category._id + "'>" + category.name + "</option>");
                });
            };
        });
};

var $mainSelectBody = $('.content.mainModal table tbody');

function search(p) {
    var gradeIds = $(".mainModal #InfoSearch #searchGrade").val();
    var filter = {
            schoolId: $(".mainModal #InfoSearch #searchSchool").val(),
            gradeId: ((gradeIds && gradeIds[0]) ? JSON.stringify(gradeIds) : ""),
            subjectId: $("#adminSubjectId").val(),
            categoryId: $(".mainModal #InfoSearch #searchCategory").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/Teacher/peopleCountList/search?" + pStr, filter)
        .then(function (data) {
            if (data && data.length > 0) {
                data.forEach(function (schoolReport) {
                    var $tr = $('<tr ><td class="trainClass" id="' + schoolReport._id + '">' + schoolReport.name + '</td><td>' +
                        schoolReport.enrollCount + '</td><td>' +
                        schoolReport.totalStudentCount + '</td></tr>');
                    $mainSelectBody.append($tr);
                });
            }
        });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
    search();
});

$(".mainModal #gridBody").on("click", "tr .trainClass", function (e) {
    var id = $(e.currentTarget).attr("id");
    if (id) {
        location.href = "/Teacher/adminEnrollTrain/orderlist/" + id;
    } else {
        // showAlert("出错了！");
    }
});

//------------end