$(document).ready(function() {
    $("#btnAdmin").addClass("active");

    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');

function search() {
    var filter = {
        gradeId: $("#gradeId").val()
    };

    $mainSelectBody.empty();
    selfAjax("post", "/admin/gradeSubjectRelationList/search", filter, function(data) {
        if (data && data.subjects.length > 0) {
            data.subjects.forEach(function(subject) {
                var checkStr = "";
                if (data.relations.some(function(relation) {
                        return relation.subjectId == subject._id;
                    })) {
                    checkStr = "checked isChecked=1";
                }
                var $tr = $('<tr id=' + subject._id + '><td><span><input type="checkbox" class="subjectId" name="subjectId" ' + checkStr + ' value=' + subject._id + ' /></span>' + subject.name + '</td></tr>');
                $mainSelectBody.append($tr);
            });
        }
    });
};

//------------end
function getSubjects() {
    var result = {
        newSubjects: [],
        removeSubjects: []
    };

    $(".content.mainModal table tbody tr .subjectId")
        .each(function(index) {
            if (this.checked) {
                if ($(this).attr("isChecked") != "1") {
                    result.newSubjects.push($(this).val());
                }
            } else {
                if ($(this).attr("isChecked") == "1") {
                    result.removeSubjects.push($(this).val());
                }
            }
        });
    return result;
};

$("#btnSave").on("click", function(e) {
    var result = getSubjects();
    $.post("/admin/gradeSubjectRelation/save", {
        newSubjects: JSON.stringify(result.newSubjects),
        removeSubjects: JSON.stringify(result.removeSubjects),
        gradeId: $("#gradeId").val()
    }, function(data) {
        search();
    });
});

$("#btnReturn").on("click", function(e) {
    location.href = "/admin/gradeList";
});