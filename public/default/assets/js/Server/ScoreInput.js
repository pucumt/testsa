var isNew = true;

$(document).ready(function() {
    $("#left_btnScoreInput").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
});

//------------search funfunction

var $mainSelectBody = $('.content.mainModal table tbody');

function search(p) {
    var filter = {
            studentName: $(".mainModal #InfoSearch #studentName").val(),
            mobile: $(".mainModal #InfoSearch #mobile").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    $.post("/admin/adminEnrollExam/searchCard?" + pStr, filter, function(data) {
        if (data && data.adminEnrollExams.length > 0) {
            data.adminEnrollExams.forEach(function(examOrder) {
                $mainSelectBody.append('<tr id=' + examOrder._id + ' data-obj=' +
                    JSON.stringify(examOrder) + '><td>' + examOrder._id + '</td><td>' + examOrder.studentName + '</td><td>' +
                    examOrder.examName + '</td><td>' + (examOrder.score || '') + '</td></tr>');
            });
        }
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    search();
});

$("#editfile #btnResult").on("click", function(e) {
    location.href = "/admin/score";
});

$("#editfile #btnReport").on("click", function(e) {

});
//------------end

var $selectHeader = $('#selectModal .modal-body table thead');
var $selectBody = $('#selectModal .modal-body table tbody');
var $selectSearch = $('#selectModal #InfoSearch');

function openExam(p) {
    $('#selectModal #selectModalLabel').text("选择测试");
    var filter = { name: $("#selectModal #InfoSearch #studentName").val(), mobile: $("#selectModal #InfoSearch #mobile").val() },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>测试名称</th><th width="180px">测试类别</th><th width="120px">报名情况</th></tr>');
    $.post("/admin/examClass/search?" + pStr, filter, function(data) {
        if (data && data.examClasss.length > 0) {
            data.examClasss.forEach(function(examClass) {
                $selectBody.append('<tr data-obj=' + JSON.stringify(examClass) + '><td>' + examClass.name +
                    '</td><td>' + examClass.examCategoryName + '</td><td>' + examClass.enrollCount + '/' +
                    examClass.examCount + '</td></tr>');
            });
            setSelectEvent($selectBody, function(entity) {
                $('#editfile #examName').val(entity.name); //
                $('#editfile #examId').val(entity._id); //
                $('#selectModal').modal('hide');
                resetDropDown(entity.subjects);
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
        $('#selectModal').modal({ backdrop: 'static', keyboard: false });
    });
};

$("#panel_btnExam").on("click", function(e) {
    openEntity = "exam";
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="examName" class="control-label">名称:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="examName" id="examName"></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    openExam();
});

$("#selectModal #InfoSearch").on("click", "#btnSearch", function(e) {
    openExam();
});

$("#selectModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    openExam(page);
});

$("#selectModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    openExam(page);
});

function resetDropDown(data) {
    $('#editfile').find("#subject option").remove();
    data.forEach(function(subject) {
        $("#editfile #subject").append("<option value='" + subject.subjectId + "'>" + subject.subjectName + "</option>");
    });
};