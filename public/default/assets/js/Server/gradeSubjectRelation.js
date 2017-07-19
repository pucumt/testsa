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
                var checkStr = "",
                    buttonStr = "";
                if (data.relations.some(function(relation) {
                        return relation.subjectId == subject._id;
                    })) {
                    checkStr = "checked isChecked=1";
                    buttonStr = '<a class="btn btn-default btnReset">设置</a>';
                }
                var trObject = $('<tr id=' + subject._id + '><td><span><input type="checkbox" class="subjectId" name="subjectId" ' + checkStr + ' value=' + subject._id + ' /></span>' +
                    subject.name + '</td><td><div class="btn-group">' + buttonStr + '</div></td></tr>');
                trObject.find(".btn-group").data("obj", subject);
                $mainSelectBody.append(trObject);
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

$(".mainModal #gridBody").on("click", "td .btnReset", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    location.href = "/admin/gradeSubject/settings/" + $("#gradeId").val() + "/" + entity._id;
});