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
//------------end

$(".mainModal #gridBody").on("click", "tr", function(e) {
    destroy();
    addValidation();

    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    $('#myModal #myModalLabel').text("考试信息");
    $('#myModal #name').text(entity.examName);
    $('#myModal #classRoomName').text(entity.classRoomName);
    $('#myModal #examNo').text(entity.examNo);
    $('#myModal #score').val(entity.score);
    $('#myModal #id').val(entity._id);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

function destroy() {
    var validator = $('#myModal').data('formValidation');
    if (validator) {
        validator.destroy();
    }
}

function addValidation(callback) {
    $('#myModal').formValidation({
        // List of fields and their validation rules
        fields: {
            'score': {
                trigger: "blur change",
                validators: {
                    numeric: {
                        message: '填写的不是数字',
                    }
                }
            }
        }
    });
};

$("#myModal #btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/adminEnrollExam/ScoreInput",
            postObj = {
                score: $('#myModal #score').val(),
                id: $('#myModal #id').val()
            };
        $.post(postURI, postObj, function(data) {
            $('#myModal').modal('hide');
            if (data) {
                var $lastDiv = $('#' + $('#myModal #id').val() + ' td:last-child');
                $lastDiv.text($('#myModal #score').val());
            }
        });
    }
});