var isNew = true;

$(document).ready(function() {
    if ($("#fromPage").val() == "score") {
        $("#left_btnScoreInput").addClass("active");
        $("#btnReturn").attr("href", "/admin/ScoreInput");
    } else {
        $("#left_btnStudent").addClass("active");
    }


    renderScore();
});

//------------search funfunction
function renderScore() {
    selfAjax("post", "/admin/adminEnrollExam/searchExamScore", { id: $("#id").val() }, function(data) {
        if (data) {
            if ($("#fromPage").val() != "score") {
                $("#btnReturn").attr("href", "/admin/studentDetail/" + data.studentId);
            }
            $(".mainModal .detail .studentName").text(data.studentName);
            $(".mainModal .detail .examName").text(data.examName);

            $(".mainModal .detail .examDate").text(moment(data.examDate).format("YYYY-MM-DD"));
            $(".mainModal .detail .examTime").text(data.examTime);
            if (data.scores && data.scores.length > 0) {
                var d = $(document.createDocumentFragment());
                data.scores.forEach(function(score) {
                    var download = '';
                    if (score.report) {
                        download = '&nbsp;&nbsp;<strong>报告</strong>:<a href="/uploads/' + score.report + '">下载</a>';
                    }
                    d.append('<div><strong>科目</strong>:' + score.subjectName + '&nbsp;&nbsp;<strong>成绩</strong>:' + (score.score || '') + download + '</div>');
                });
                $(".mainModal .detail .score").append(d);
            }
        }
    });
};

//------------end