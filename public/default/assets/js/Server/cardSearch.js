var isNew = true;

$(document).ready(function() {
    $("#left_btnCard").addClass("active");
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
//------------end

$(".mainModal #gridBody").on("click", "tr", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    $('#myModal #myModalLabel').text("考试信息");
    $('#myModal #name').text(entity.examName);
    var filter = { id: entity._id };
    $.post("/admin/adminEnrollExam/searchExam", filter, function(data) {
        if (data) {
            var examDate = data.examDate && moment(data.examDate).format("YYYY-M-D");
            $('#myModal #examDate').text(examDate);
            $('#myModal #examTime').text(data.examTime);
            $('#myModal #schoolArea').text(data.schoolArea);
            $('#myModal #classRoomName').text(data.classRoomName);
            $('#myModal #examNo').text(data.examNo);
            $('#myModal #score').text(data.score);
            $('#myModal').modal({ backdrop: 'static', keyboard: false });
        }
    });
});