var isNew = true;

$(document).ready(function () {
    $("#left_btnClassEnroll").addClass("active");

    renderClasses();
});

var $mainSelectBody = $('.content.mainModal table tbody');

function renderClasses() {
    selfAjax("post", "/admin/trainClass/classesFromTeacherOfcurrent", null, function (data) {
        if (data && data.classs.length > 0) {
            data.classs.forEach(function (trainClass) {
                var $tr = $('<tr ><td class="trainClass" id=' + trainClass._id + '>' + trainClass.name + '</td><td>' +
                    trainClass.enrollCount + '</td><td>' + trainClass.totalStudentCount + '</td></tr>');
                $tr.data("obj", trainClass);
                $mainSelectBody.append($tr);
            });
        }
    });
};

$(".mainModal #gridBody").on("click", "tr .trainClass", function (e) {
    var id = $(e.currentTarget).attr("id");
    if (id) {
        location.href = "/admin/teacher/orderlist/" + id;
    } else {
        // showAlert("出错了！");
    }
});