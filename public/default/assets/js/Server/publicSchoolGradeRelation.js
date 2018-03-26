var isNew = true;

$(document).ready(function () {
    $("#left_btnPublicSchool").addClass("active");

    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');

function search() {
    var filter = {
        publicSchoolId: $("#publicSchoolId").val()
    };
    $mainSelectBody.empty();
    selfAjax("post", "/admin/publicSchoolGradeRelationList/search", filter, function (data) {
        if (data && data.publicGrades.length > 0) {
            data.publicGrades.forEach(function (grade) {
                var checkStr = "";
                if (data.relations.some(function (relation) {
                        return relation.publicGradeId == grade._id;
                    })) {
                    checkStr = "checked isChecked=1";
                }
                var $tr = $('<tr id=' + grade._id + '><td><span><input type="checkbox" class="publicGradeId" name="publicGradeId" ' + checkStr + ' value=' + grade._id + ' /></span>' + grade.name + '</td></tr>');
                $mainSelectBody.append($tr);
            });
        }
    });
};

//------------end

function getGrades() {
    var result = {
        newGrades: [],
        removeGrades: []
    };

    $(".content.mainModal table tbody tr .publicGradeId")
        .each(function (index) {
            if (this.checked) {
                if ($(this).attr("isChecked") != "1") {
                    result.newGrades.push($(this).val());
                }
            } else {
                if ($(this).attr("isChecked") == "1") {
                    result.removeGrades.push($(this).val());
                }
            }
        });
    return result;
};

$("#btnSave").on("click", function (e) {
    var result = getGrades();
    selfAjax("post", "/admin/publicSchoolGradeRelation/save", {
        newGrades: JSON.stringify(result.newGrades),
        removeGrades: JSON.stringify(result.removeGrades),
        publicSchoolId: $("#publicSchoolId").val()
    }, function (data) {
        search();
    });
});

$("#btnReturn").on("click", function (e) {
    location.href = "/admin/publicSchool";
});