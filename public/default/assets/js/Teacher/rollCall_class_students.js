$(document).ready(function() {
    loadData();

    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/Teacher/rollCallClasses";
    });

    function getAllCheckedStudents() {
        var studentIds = [];
        $(".exam-list li .chkStudent")
            .each(function(index) {
                if (this.checked) {
                    studentIds.push($(this).val());
                }
            });
        return studentIds;
    };

    $("#btnAbsent").on("click", function(e) {
        selfAjax("post", "/Teacher/absent/students", {
                originalUrl: "/Teacher/rollCall/students/" + $("#id").val(),
                studentIds: JSON.stringify(getAllCheckedStudents()),
                classId: $("#id").val()
            })
            .then(function(data) {
                if (data && data.sucess) {
                    showAlert("保存成功！");
                }
            });
    });
});

var $selectBody = $('.container.enroll .exam-list');

function loadData() {
    selfAjax("post", "/Teacher/rollCall/students", { id: $("#id").val() }).then(function(data) {
        if (data && data.students.length > 0) {
            var d = $(document.createDocumentFragment());
            data.students.sort(function(a, b) {
                return a.name.localeCompare(b.name);
            }).forEach(function(student) {
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
        checkStr = (abStudents && abStudents.some(function(abStudent) {
            return abStudent.studentId == student._id;
        })) ? "checked" : "";
    $li.data("obj", student);
    $li.append($goodContainer);
    $goodContainer.append($infoContainer);
    $infoContainer.append($('<div class="checkbox"><label><input class="chkStudent" ' + checkStr + ' type="checkbox" value=' + student._id + ' />' + student.name + '(' + student.mobile + ')</label></div>'));
    return $li;
};