var isNew = true;

$(document).ready(function () {
    $("#left_btnQuizInput").addClass("active");

    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    renderClasses();

    $('.content.mainModal table tbody').on("change blur", "tr .inputScore", function (e) {
        var $obj = $(e.target);
        $obj.parents("td").find(".spanScore").text($obj.val());
    });
});

function renderClasses() {
    selfAjax("post", "/admin/trainClass/classesFromTeacher", null, function (data) {
        if (data && data.classs.length > 0) {
            data.classs.forEach(function (trainClass) {
                $("#InfoSearch #drptranClass").append("<option value='" + trainClass._id + "'>" + trainClass.name + "</option>");
            });
        }
        search();
    });
};

//------------search function
var $mainSelectBody = $('.content.mainModal table tbody');

function getScoreTd(score, i) {
    return '<td class="score' + i + '"><span class="spanScore">' + score + '</span><input type="number" maxlength="5" style="display:none;" class="form-control inputScore" value="' + score + '"></td>';
};

function search() {
    var filter = {
        name: $(".mainModal #InfoSearch #Name").val(),
        trainId: $(".mainModal #InfoSearch #drptranClass").val()
    };
    $mainSelectBody.empty();
    selfAjax("post", "/admin/quizScoreList/search?", filter, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (score) {
                var score1 = (score.score1 || 0),
                    score2 = (score.score2 || 0),
                    score3 = (score.score3 || 0),
                    score4 = (score.score4 || 0),
                    score5 = (score.score5 || 0);
                var $tr = $('<tr id=' + score._id + '><td class="">' + score.name + '(' + score.mobile + ')</td>' +
                    getScoreTd(score1, 1) +
                    getScoreTd(score2, 2) +
                    getScoreTd(score3, 3) +
                    getScoreTd(score4, 4) +
                    getScoreTd(score5, 5) +
                    '</tr>');
                $tr.data("obj", score);
                $mainSelectBody.append($tr);
            });
        }
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
    search();
});

//------------end

$("#btnAdd").on("click", function (e) {
    $("#btnAdd").hide();
    $("#btnSave").show();
    // show inputs
    showScoreInput(true);
});

$("#btnSave").on("click", function (e) {
    // $("#btnAdd").show();
    // $("#btnSave").hide();
    // // show spans
    // showScoreInput(false);
    // save to db
    selfAjax("post", "/admin/quizScore/save", {
        scores: getScores()
    }, function (data) {
        location.reload();
    });
});

function getScores() {
    var scores = [];
    $(".content.mainModal table tbody tr").each(function () {
        var trObj = $(this);
        var trData = trObj.data("obj"),
            score = {
                studentId: trData._id,
                subjectId: trData.subjectId,
                yearId: trData.yearId,
                scoreId: trData.scoreId,
                score1: trObj.find("td.score1 .inputScore").val(),
                score2: trObj.find("td.score2 .inputScore").val(),
                score3: trObj.find("td.score3 .inputScore").val(),
                score4: trObj.find("td.score4 .inputScore").val(),
                score5: trObj.find("td.score5 .inputScore").val()
            }
        scores.push(score);
    });

    return JSON.stringify(scores);
};

function showScoreInput(isShow) {
    if (isShow) {
        $(".content.mainModal table tbody .spanScore").hide();
        $(".content.mainModal table tbody .inputScore").show();
    } else {
        $(".content.mainModal table tbody .spanScore").show();
        $(".content.mainModal table tbody .inputScore").hide();
    }
};