var isNew = true;

$(document).ready(function () {
    $("#left_btnTrainClass").addClass("active");
    renderSearchSchoolYearAttributeDropDown();
    renderSearchGradeDropDown();

    $(".mainModal #searchYear")
        .off("change")
        .on("change", function (e) {
            changeAttributes();
        });
});
//------------search funfunction
$("#btnSubmit").on("click", function (e) {
    showConfirm("真的要发布吗？");

    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/batchTrainClasspublish", {
            id: $(".mainModal #searchYear").val(),
            schoolId: $(".mainModal #searchSchool").val(),
            attributeId: $(".mainModal #searchAttribute").val()
        }, function (data) {
            if (data && data.sucess) {
                showAlert("发布成功！", null, true);
            } else {
                showAlert("发布失败！", null, true);
            }
        });
    });
});

$("#btnStop").on("click", function (e) {
    showConfirm("真的要停用吗？");

    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/batchTrainClassUnpublish", {
            id: $(".mainModal #searchYear").val(),
            schoolId: $(".mainModal #searchSchool").val(),
            attributeId: $(".mainModal #searchAttribute").val()
        }, function (data) {
            if (data && data.sucess) {
                showAlert("停用成功！", null, true);
            } else {
                showAlert("停用失败！", null, true);
            }
        });
    });
});


function renderSearchSchoolYearAttributeDropDown() {
    selfAjax("get", "/admin/trainClass/schoolyearattribute", {}, function (data) {
        objFilters = data;
        if (data.years && data.years.length > 0) {
            data.years.forEach(function (year) {
                var select = "";
                if (year.isCurrentYear) {
                    select = "selected";
                }
                $(".mainModal #searchYear").append("<option value='" + year._id + "' " + select + ">" + year.name + "</option>");
            });
        };
        if (data.schools && data.schools.length > 0) {
            data.schools.forEach(function (school) {
                var select = "";
                if ($("#adminSchoolId").val() == school._id) {
                    select = "selected";
                }
                $(".mainModal #searchSchool").append("<option value='" + school._id + "' " + select + ">" + school.name + "</option>");
            });
        };
        changeAttributes();
    });
};


function changeAttributes() {
    $('.mainModal #searchAttribute').find("option").remove();
    if (objFilters.classAttributes.length > 0) {
        var yearAttributeRelations = objFilters.classAttributes.filter(function (relation) {
            return relation.yearId == $(".mainModal #searchYear").val();
        });
        if (yearAttributeRelations.length > 0) {
            $('.mainModal .attribute').show();
            yearAttributeRelations.forEach(function (classAttribute) {
                $(".mainModal #searchAttribute").append("<option value='" + classAttribute._id + "'>" + classAttribute.name + "</option>");
            });
        } else {
            $('.mainModal .attribute').hide();
        }
    }
};

function renderSearchGradeDropDown() {
    $(".mainModal #searchGrade").append("<option value=''></option>");
    selfAjax("get", "/admin/grade/getAll", null, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (grade) {
                $(".mainModal #searchGrade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
            });
        };
    });
};

$("#btnBatchAdd").on("click", function (e) {
    showConfirm("真的要加100吗？");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/batchAdd100", {
            id: $(".mainModal #searchYear").val(),
            schoolId: $(".mainModal #searchSchool").val(),
            attributeId: $(".mainModal #searchAttribute").val(),
            gradeId: $(".mainModal #searchGrade").val()
        }, function (data) {
            if (data && data.sucess) {
                showAlert("加100成功！", null, true);
            } else {
                showAlert("加100失败！", null, true);
            }
        });
    });
});

$("#btnBatchMin").on("click", function (e) {
    showConfirm("真的要减100吗？");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/batchMin100", {
            id: $(".mainModal #searchYear").val(),
            schoolId: $(".mainModal #searchSchool").val(),
            attributeId: $(".mainModal #searchAttribute").val(),
            gradeId: $(".mainModal #searchGrade").val()
        }, function (data) {
            if (data && data.sucess) {
                showAlert("减100成功！", null, true);
            } else {
                showAlert("减100失败！", null, true);
            }
        });
    });
});