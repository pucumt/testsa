var isNew = true;

$(document).ready(function() {
    $("#left_btnRollCall").addClass("active");

    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    renderSearchSchoolDropDown();
});

//------------search funfunction
function renderSearchSchoolDropDown() {
    selfAjax("post", "/admin/adminRollCallClassList/schoolArea", null, function(data) {
        if (data && data.length > 0) {
            data.forEach(function(school) {
                $(".mainModal #InfoSearch #searchSchool").append("<option value='" + school._id + "'>" + school.name + "</option>");
            });
            search();
        };
    });
};

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function() {
    var buttons = '<a class="btn btn-default btnEdit">备注</a>';
    return buttons;
};

function search(p) {
    var filter = {
            schoolId: $(".mainModal #InfoSearch #searchSchool").val(),
            isChecked: $(".mainModal #InfoSearch #isChecked").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/absentStudentsList/search?" + pStr, filter, function(data) {
        if (data && data.absentStudents.length > 0) {
            data.absentStudents.forEach(function(absentStudent) {
                var $tr = $('<tr id=' + absentStudent._id + '><td>' + absentStudent.className + '</td><td>' +
                    absentStudent.teacherName + '</td><td>' + absentStudent.studentName + '</td><td>' + absentStudent.mobile +
                    '</td><td>' + moment(absentStudent.createdDate).format("YYYY-MM-DD HH:mm") +
                    '</td><td>' + (absentStudent.comment || "") + '</td><td><div class="btn-group">' + getButtons() + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", absentStudent);
                $mainSelectBody.append($tr);
            });
        }
        $("#mainModal #total").val(data.total);
        $("#mainModal #page").val(data.page);
        setPaging("#mainModal", data);
    });
};

$("#myModal .modal-body ul.dropdown-menu-right li a").on("click", function(e) {
    $("#myModal .modal-body #comment").val($(e.currentTarget).html());
});

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

$("#myModal #btnDone").on("click", function(e) {
    var postURI = "/admin/absentStudents/comment",
        postObj = {
            id: $('#id').val(),
            comment: $.trim($('#comment').val()),
            isCheck: 1
        };
    selfAjax("post", postURI, postObj, function() {
        $('#myModal').modal('hide');
        var page = parseInt($("#mainModal #page").val());
        search(page);
    });
});

$("#myModal #btnBak").on("click", function(e) {
    var postURI = "/admin/absentStudents/comment",
        postObj = {
            id: $('#id').val(),
            comment: $.trim($('#comment').val()),
            isCheck: 0
        };
    selfAjax("post", postURI, postObj, function() {
        $('#myModal').modal('hide');
        var page = parseInt($("#mainModal #page").val());
        search(page);
    });
});

$("#gridBody").on("click", "td .btnEdit", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $('#myModalLabel').text("备注");
    $('#comment').val(entity.comment);
    $('#id').val(entity._id);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});