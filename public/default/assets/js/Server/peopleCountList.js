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
    renderAttribute();

    if ($("#adminSubjectId").val()) {
        $(".subject-container").hide();
    }
});

//------------search funfunction
function renderSearchSchoolDropDown() {
    selfAjax("get", "/admin/schoolArea/all", null, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (school) {
                $(".mainModal #InfoSearch #searchSchool").append("<option value='" + school._id + "'>" + school.name + "</option>");
            });
        };
    });
};

function renderSearchGradeDropDown() {
    // $(".mainModal #InfoSearch #searchGrade").append("<option value=''></option>");
    selfAjax("get", "/admin/grade/getAll", null, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (grade) {
                $(".mainModal #InfoSearch #searchGrade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
            });
        };
    });
};

function renderSearchSubjectDropDown() {
    $(".mainModal #InfoSearch #searchSubject").append("<option value=''></option>");
    selfAjax("get", "/admin/subject/getAllWithoutPage", null, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (subject) {
                var selectStr = "";
                if ($("#adminSubjectId").val() == subject._id) {
                    selectStr = "selected";
                }
                $(".mainModal #InfoSearch #searchSubject").append("<option value='" + subject._id + "' " + selectStr + ">" + subject.name + "</option>");
            });
        };
    });
};

function renderSearchCategoryDropDown() {
    $(".mainModal #InfoSearch #searchCategory").append("<option value=''></option>");
    selfAjax("get", "/admin/category/all", null, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (category) {
                $(".mainModal #InfoSearch #searchCategory").append("<option value='" + category._id + "'>" + category.name + "</option>");
            });
        };
    });
};


function renderAttribute() {
    selfAjax("post", "/admin/classAttribute/getChecked", null, function (data) {
        if (data) {
            if (data.length > 0) {
                data.forEach(function (classAttribute) {
                    $("#InfoSearch #drpAttribute").append("<option value='" + classAttribute._id + "'>" + classAttribute.name + "</option>");
                });
            } else {
                $('#InfoSearch .attribute').hide();
            }
        }
    });
};

var $mainSelectBody = $('.content.mainModal table tbody');

function search(p) {
    var gradeIds = $(".mainModal #InfoSearch #searchGrade").val();
    var filter = {
            schoolId: $(".mainModal #InfoSearch #searchSchool").val(),
            gradeId: ((gradeIds && gradeIds[0]) ? JSON.stringify(gradeIds) : ""),
            subjectId: $(".mainModal #InfoSearch #searchSubject").val(),
            categoryId: $(".mainModal #InfoSearch #searchCategory").val(),
            attributeId: $("#InfoSearch #drpAttribute").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/peopleCountList/search?" + pStr, filter, function (data) {
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
        location.href = "/admin/adminEnrollTrain/orderlist/" + id;
    } else {
        // showAlert("出错了！");
    }
});

//------------end