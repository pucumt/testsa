$(document).ready(function() {
    $("#orgDate").val(moment().format("YYYY-MM-DD"));
    $(".enroll-filter .btn-search")
        .on("click", function(e) {
            $('.enroll .exam-list').empty();
            loadData();
            $('.enroll-filter').hide();
            $('.container.enroll').show();
        });

    $(".enroll .pageTitle .filter")
        .on("click", function(e) {
            $('.enroll-filter').show();
            $('.container.enroll').hide();
        });

    $(".enroll-filter .glyphicon-remove-circle")
        .on("click", function(e) {
            $(".enroll-filter").hide();
            $('.container.enroll').show();
        });

    renderfilter();

    // loadData();

    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/Teacher/rollCallClasses/extra";
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

    function checkIsAllAbsent() {
        var studentIds = [],
            isAbsent = true;
        $(".exam-list li .chkStudent")
            .each(function(index) {
                if (this.checked) {
                    if ($(this).attr("isAbsent") == "0") {
                        isAbsent = false;
                    }
                    studentIds.push($(this).val());
                }
            });
        return isAbsent ? studentIds : false;
    };

    $("#btnMakeUp").on("click", function(e) {
        var studentIds = checkIsAllAbsent();
        //只有缺勤的才可以补课
        if (studentIds) {
            selfAjax("post", "/Teacher/absent/students/makeUp", {
                    originalUrl: "/Teacher/rollCall/students/" + $("#id").val(),
                    studentIds: JSON.stringify(studentIds),
                    classId: $("#id").val(),
                    absentDate: $("#orgDate").val()
                })
                .then(function(data) {
                    if (data && data.sucess) {
                        loadData();
                    }
                });
        } else {
            showAlert("请只选择缺勤的学生！");
        }
    });

    $("#btnAbsent").on("click", function(e) {
        selfAjax("post", "/Teacher/absent/students", {
                originalUrl: "/Teacher/rollCall/students/" + $("#id").val(),
                studentIds: JSON.stringify(getAllCheckedStudents()),
                classId: $("#id").val(),
                absentDate: $("#orgDate").val()
            })
            .then(function(data) {
                if (data && data.sucess) {
                    loadData();
                }
            });
    });
});

function renderfilter() {
    $(".enroll-filter").show();
    $('.container.enroll').hide();
};

var $selectBody = $('.container.enroll .exam-list');

function loadData() {
    $selectBody.empty();

    selfAjax("post", "/Teacher/rollCall/students", {
        id: $("#id").val(),
        absentDate: $("#orgDate").val()
    }).then(function(data) {
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
        isAbsent = 0,
        checkStr = "",
        absentStr = "";

    if (abStudents && abStudents.some(function(abStudent) {
            return abStudent.studentId == student._id;
        })) {
        isAbsent = 1;
        checkStr = " checked";
        absentStr = "<B>缺勤</B>";
    }

    $li.data("obj", student);
    $li.append($goodContainer);
    $goodContainer.append($infoContainer);
    $infoContainer.append($('<div class="checkbox"><label><input class="chkStudent" type="checkbox"  isAbsent=' + isAbsent + checkStr + ' value=' + student._id + ' />' + student.name + '(' + student.mobile + ')' + absentStr + '</label></div>'));
    return $li;
};