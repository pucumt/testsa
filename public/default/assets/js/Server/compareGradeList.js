var isNew = true;

$(document).ready(function () {
    $("#left_btnCompareGrade").addClass("active");
});

//------------search funfunction

var $mainSelectBody = $('.content.mainModal table tbody');

function search(p) {
    $mainSelectBody.empty();
    selfAjax("post", "/admin/compareGradeList/search", null, function (data) {
        if (data) {
            for (key in data) {
                var schoolReport = data[key];
                var ration = ((schoolReport.newCount / schoolReport.oldCount) * 100).toFixed(1);
                var $tr = $('<tr ><td>' + schoolReport.gradeName + '</td><td>' +
                    schoolReport.subjectName + '</td><td>' +
                    schoolReport.oldCount + '</td><td>' +
                    schoolReport.newCount + '</td><td>' +
                    ration + '%</td></tr>');
                $mainSelectBody.append($tr);
            };
        }
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
    search();
});
//------------end