var isNew = true;

$(document).ready(function () {
    $("#left_btnEnrollAggregate").addClass("active");
    renderSearchGradeDropDown();
});

//------------search funfunction
function renderSearchGradeDropDown() {
    $(".mainModal #InfoSearch #searchGrade").append("<option value=''></option>");
    selfAjax("get", "/admin/grade/getAll", null, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (grade) {
                $(".mainModal #InfoSearch #searchGrade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
            });
        };
    });

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
$(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
    $mainSelectBody.empty();
    selfAjax("post", "/admin/enrollAggregateList/search", {
        gradeId: $(".mainModal #InfoSearch #searchGrade").val(),
        attributeId: $("#InfoSearch #drpAttribute").val()
    }, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (schoolReport) {
                var $tr = $('<tr><td class="trainClass" >' + schoolReport.name + '</td><td>' +
                    schoolReport.value + '</td></tr>');
                $mainSelectBody.append($tr);
            });
        }
    });
});
//------------end