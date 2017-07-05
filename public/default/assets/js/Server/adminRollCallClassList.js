var isNew = true;

$(document).ready(function() {
    $("#left_btnRollCallClass").addClass("active");

    $("#startDate").datetimepicker({
        format: 'hh:ii',
        autoclose: true,
        language: "zh-CN",
        startView: 1
    });

    $("#endDate").datetimepicker({
        format: 'hh:ii',
        autoclose: true,
        language: "zh-CN",
        startView: 1
    });

    $("#startDate").val("00:00");
    $("#endDate").val("23:59");

    renderSearchSchoolDropDown();
});

//------------search funfunction
function renderSearchSchoolDropDown() {
    selfAjax("post", "/admin/adminRollCallClassList/schoolArea", null, function(data) {
        if (data && data.length > 0) {
            data.forEach(function(school) {
                $(".mainModal #InfoSearch #searchSchool").append("<option value='" + school._id + "'>" + school.name + "</option>");
            });
        };
    });
};

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');

function search(p) {
    var filter = {
            schoolId: $(".mainModal #InfoSearch #searchSchool").val(),
            startDate: $("#startDate").val(),
            endDate: $("#endDate").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/adminRollCallClassList/search?" + pStr, filter, function(data) {
        if (data && data.absentClasses.length > 0) {
            data.absentClasses.forEach(function(absentClass) {
                var $tr = $('<tr id=' + absentClass._id + '><td>' + absentClass.className + '</td><td>' + absentClass.teacherName +
                    '</td><td>' + absentClass.courseTime + '</td><td>' + moment(absentClass.createdDate).format("YYYY-MM-DD HH:mm") +
                    '</td><td><div class="btn-group"><a class="btn btn-default btnDelete">删除</a></div></td></tr>');
                $tr.find(".btn-group").data("obj", absentClass);
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

$("#gridBody").on("click", "td .btnDelete", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    showComfirm("确定要取消点名 (" + entity.className + ") 吗？");

    $("#btnConfirmSave").off("click").on("click", function(e) {
        selfAjax("post", "/admin/adminRollCallClassList/cancel", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                var page = parseInt($("#mainModal #page").val());
                search(page);
            }
        });
    });
});