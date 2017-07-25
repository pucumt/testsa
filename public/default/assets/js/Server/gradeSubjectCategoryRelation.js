var isNew = true;

$(document).ready(function() {
    $("#btnAdmin").addClass("active");

    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');

function search() {
    var filter = {
        gradeId: $("#gradeId").val(),
        subjectId: $("#subjectId").val()
    };

    $mainSelectBody.empty();

    selfAjax("post", "/admin/gradeSubjectCategoryRelationList/search", filter, function(data) {
        if (data && data.categories.length > 0) {
            data.categories.forEach(function(category) {
                var checkStr = "",
                    buttonStr = "";
                if (data.relations.some(function(relation) {
                        return relation.categoryId == category._id;
                    })) {
                    checkStr = "checked isChecked=1";
                }
                var trObject = $('<tr id=' + category._id + '><td><span><input type="checkbox" class="categoryId" name="categoryId" ' + checkStr + ' value=' + category._id + ' /></span>' +
                    category.name + '</td></tr>');
                $mainSelectBody.append(trObject);
            });
        }
    });
};
//------------end
function getCategories() {
    var result = {
        newCategories: [],
        removeCategories: []
    };

    $(".content.mainModal table tbody tr .categoryId")
        .each(function(index) {
            if (this.checked) {
                if ($(this).attr("isChecked") != "1") {
                    result.newCategories.push($(this).val());
                }
            } else {
                if ($(this).attr("isChecked") == "1") {
                    result.removeCategories.push($(this).val());
                }
            }
        });
    return result;
};

$("#btnSave").on("click", function(e) {
    var result = getCategories();
    selfAjax("post", "/admin/gradeSubjectCategoryRelation/save", {
        newCategories: JSON.stringify(result.newCategories),
        removeCategories: JSON.stringify(result.removeCategories),
        gradeId: $("#gradeId").val(),
        subjectId: $("#subjectId").val()
    }, function(data) {
        search();
    });
});

$("#btnReturn").on("click", function(e) {
    location.href = "/admin/grade/settings/" + $("#gradeId").val();
});