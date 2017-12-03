var isNew = true;

$(document).ready(function () {
    $("#left_btnProcessLevel").addClass("active");

    search();
});

//------------search function
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function () {
    var buttons = '<a class="btn btn-default btnReset">设置</a>';
    return buttons;
};

function search() {
    var filter = {};
    $mainSelectBody.empty();
    selfAjax("post", "/admin/subjectCategoryPLevelRelationList/search", filter, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (relation) {
                var $tr = $('<tr><td>' + relation.subjectName + '</td><td>' + relation.categoryName + '</td><td><div class="btn-group">' + getButtons() +
                    '</div></td></tr>');
                $tr.data("obj", relation);
                $mainSelectBody.append($tr);
            });
        }
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
    search();
});

//------------end

$("#gridBody").on("click", "td .btnReset", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).parents("tr").data("obj");
    location.href = "/admin/grade/settings/" + entity._id;
});