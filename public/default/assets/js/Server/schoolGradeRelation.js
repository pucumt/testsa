var isNew = true;

$(document).ready(function() {
    $("#btnAdmin").addClass("active");
    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');

function search() {
    var filter = {
        schoolId: $("#schoolId").val()
    };
    $mainSelectBody.empty();
    selfAjax("post", "/admin/schoolGradeRelationList/search", filter, function(data) {
        if (data && data.grades.length > 0) {
            data.grades.forEach(function(grade) {
                var checkStr = "";
                if (data.relations.some(function(relation) {
                        return relation.gradeId == grade._id;
                    })) {
                    checkStr = "checked isChecked=1";
                }
                var $tr = $('<tr id=' + grade._id + '><td><span><input type="checkbox" class="gradeId" name="gradeId" ' + checkStr + ' value=' + grade._id + ' /></span>' + grade.name + '</td></tr>');
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

    $(".content.mainModal table tbody tr .gradeId")
        .each(function(index) {
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

$("#btnSave").on("click", function(e) {
    var result = getGrades();
    $.post("/admin/schoolGradeRelation/save", {
        newGrades: JSON.stringify(result.newGrades),
        removeGrades: JSON.stringify(result.removeGrades),
        schoolId: $("#schoolId").val()
    }, function(data) {
        search();
    });
});

$("#btnReturn").on("click", function(e) {
    location.href = "/admin/schoolAreaList";
});