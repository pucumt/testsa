var isNew = true;

$(document).ready(function() {
    $("#left_btngradeMone").addClass("active");
    renderSearchGradeDropDown();
});

//------------search funfunction
function renderSearchGradeDropDown() {
    // $(".mainModal #InfoSearch #searchGrade").append("<option value=''></option>");
    selfAjax("get", "/admin/grade/getAll", null, function(data) {
        if (data && data.length > 0) {
            data.forEach(function(grade) {
                $(".mainModal #InfoSearch #searchGrade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
            });
        };
    });
};

$(".mainModal #InfoSearch #btnExport").on("click", function(e) {
    selfAjax("post", "/admin/export/gradeMOneList", {
        gradeId: $(".mainModal #InfoSearch #searchGrade").val()
    }, function(data) {
        if (data && data.sucess) {
            location.href = "/admin/export/scoreTemplate?name=" + encodeURI("小升初3门报名情况.xlsx");
        }
    });
});
//------------end