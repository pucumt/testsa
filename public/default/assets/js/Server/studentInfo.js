var isNew = true;

$(document).ready(function() {
    $("#left_btnStudent").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function() {
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
    return buttons;
};

function search(p) {
    var filter = {
            name: $.trim($(".mainModal #InfoSearch #Name").val()),
            mobile: $.trim($(".mainModal #InfoSearch #mobile").val())
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/studentInfo/search?" + pStr, filter, function(data) {
        $mainSelectBody.empty();
        if (data && data.studentInfos.length > 0) {
            data.studentInfos.forEach(function(studentInfo) {
                var $tr = $('<tr id=' + studentInfo._id + '><td>' + studentInfo.name + '</td><td>' + studentInfo.mobile + '</td><td><div class="btn-group">' + getButtons() + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", studentInfo);
                $mainSelectBody.append($tr);
            });
        }
        $("#mainModal #total").val(data.total);
        $("#mainModal #page").val(data.page);
        setPaging("#mainModal", data);
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    search();
});

$("#mainModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) - 1;
    search(page);
});

$("#mainModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) + 1;
    search(page);
});
//------------end

$("#gridBody").on("click", "td .btnEdit", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    location.href = "/admin/studentDetail/" + entity._id;
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    showComfirm("真的要删除" + decodeURI(entity.name) + "吗？");

    $("#btnConfirmSave").off("click").on("click", function(e) {
        selfAjax("post", "/admin/studentInfo/delete", {
            id: entity._id
        }, function(data) {
            if (data.sucess) {
                $(obj).parents()[2].remove();
                showAlert("删除成功", null, true);
            }
        });
    });
});