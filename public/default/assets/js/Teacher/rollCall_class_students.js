$(document).ready(function () {
    loadData();

    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/Teacher/rollCallClasses?type=r";
    });

    function getAllCheckedStudents() {
        var studentIds = [];
        $(".exam-list li .chkStudent")
            .each(function (index) {
                if (this.checked) {
                    studentIds.push($(this).val());
                }
            });
        return studentIds;
    };

    $("#btnAbsent").on("click", function (e) {
        selfAjax("post", "/Teacher/absent/students", {
                originalUrl: "/Teacher/rollCall/students/" + $("#id").val(),
                studentIds: JSON.stringify(getAllCheckedStudents()),
                classId: $("#id").val()
            })
            .then(function (data) {
                if (data && data.sucess) {
                    showAlert("保存成功！");
                }
            });
    });
});

var $selectBody = $('.container.enroll .exam-list');

function loadData() {
    selfAjax("post", "/Teacher/rollCall/students", {
        id: $("#id").val()
    }).then(function (data) {
        if (data && data.students.length > 0) {
            var d = $(document.createDocumentFragment());
            data.students.sort(function (a, b) {
                return a.mobile.localeCompare(b.mobile);
            }).forEach(function (student) {
                d.append(generateLi(student, data.abStudents));
            });
            $selectBody.append(d);
        } else {
            $selectBody.text("没有学生！");
        }
    });
};

function generateLi(student, abStudents) {
    var $li = $('<li class="exam-card card" ></li>'),
        $goodContainer = $('<div class="exam link"></div>'),
        $infoContainer = $('<div class="exam-info"></div>'),
        checkStr = "",
        bak = "";
    if ((abStudents && abStudents.some(function (abStudent) {
            if (abStudent.studentId == student._id) {
                if (abStudent.comment) {
                    if ($.trim(abStudent.comment) == "迟到") {
                        bak = "<b style='color:red;'>(" + abStudent.comment + ")</b>";
                    } else {
                        bak = "(" + abStudent.comment + ")";
                    }
                }
                return true;
            }
        }))) {
        checkStr = "checked";
    }
    $li.data("obj", student);
    $li.append($goodContainer);
    $goodContainer.append($infoContainer);

    $infoContainer.append($('<div class="checkbox"><label><input class="chkStudent" ' + checkStr + ' type="checkbox" value=' + student._id + ' />' + student.name + '(' + student.mobile + ')' + bak + '</label></div>'));
    return $li;
};