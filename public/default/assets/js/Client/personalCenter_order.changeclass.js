var newStudent = true,
    editStudent,
    orderId;

$(document).ready(function() {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function(e) {
        //back to order form
        location.href = "/personalCenter/order";
    });

    $(".enroll.personalCenter .changeClass .trainclass").on("click", function(e) {
        //open class list form
        $(".enroll.personalCenter").hide();
        $(".enroll-filter").show();
        $("#Enroll-select").hide();
    });

    $("#Enroll-select.changeClass .title .glyphicon-menu-left").on("click", function(e) {
        //close class list form
        $("#Enroll-select").hide();
        $(".enroll.personalCenter").show();
    });

    $("#Enroll-select.changeClass .filter").on("click", function(e) {
        //click filter
        $(".enroll-filter").show();
        $("#Enroll-select").hide();
    });

    $(".enroll-filter .glyphicon-remove-circle").on("click", function(e) {
        //close filter
        $("#Enroll-select").show();
        $(".enroll-filter").hide();
    });

    $(".enroll-filter .btn-search").on("click", function(e) {
        //search classes
        loadData();
        $("#Enroll-select").show();
        $(".enroll-filter").hide();
    });

    $("#Enroll-select.changeClass ul.exam-list").on("click", "li", function(e) {
        //select new class
        var obj = e.currentTarget;
        var entity = $(obj).data("obj");
        $(".orderList .changeClass .trainclass .name").text(entity.name);
        $(".orderList .changeClass .trainclass #newClassId").val(entity._id);
        $(".enroll.personalCenter").show();
        $("#Enroll-select").hide();
    });

    $("#btnChangeClass").on("click", function(e) {
        //select new class
        if ($(".orderList .changeClass .trainclass .name").text() == "" || $(".orderList .changeClass .trainclass #newClassId").val() == "") {
            $(".enroll.personalCenter").hide();
            $(".enroll-filter").show();
            $("#Enroll-select").hide();
        } else {
            if ($(".orderList .changeClass .trainclass #newClassId").val() == $("#trainId").val()) {
                showAlert("您调的班级跟原班级是同一个!");
                return;
            }
            $("#btnChangeClass").attr("disabled", "disabled");
            selfAjax("post", "/enroll/changeClass", {
                orderId: $("#orderId").val(),
                trainId: $(".orderList .changeClass .trainclass #newClassId").val(),
                originalUrl: "/personalCenter/changeClass/id/" + $("#orderId").val()
            }, function(data) {
                $("#btnChangeClass").removeAttr("disabled");
                if (data) {
                    if (data.notLogin) {
                        location.href = "/login";
                        return;
                    }
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    location.href = "/personalCenter/order";
                }
            });
        }
    });

    renderfilter();
});

function renderfilter() {
    selfAjax("get", "/enroll/school", null, function(data) {
        if (data) {
            if (data.schools.length > 0) {
                data.schools.forEach(function(school) {
                    $(".enroll-filter #drpSchool").append("<option value='" + school._id + "'>" + school.name + "</option>");
                });
            }
            loadData();
        }
    });
};

var $selectBody = $('#Enroll-select.changeClass .row .exam-list');

function loadData() {
    $selectBody.empty();
    selfAjax("post", "/enroll/filterClasses", {
        schoolId: $("#drpSchool").val(),
        gradeId: $("#gradeId").val(),
        subjectId: $("#subjectId").val(),
        categoryId: $("#categoryId").val(),
        timespan: $("#drpDateSpan").val() + $("#drpTimeSpan").val()
    }, function(data) {
        if (data) {
            if (data.classs.length > 0) {
                var d = $(document.createDocumentFragment());
                data.classs.forEach(function(trainclass) {
                    d.append(generateLi(trainclass));
                });
                $selectBody.append(d);
            }
        }
    });
};

function generateLi(trainclass) {
    var $li = $('<li class="exam-card card" ></li>'),
        $goodContainer = $('<div id=' + trainclass._id + ' class="exam link"></div>'),
        $infoContainer = $('<div class="exam-info"></div>');
    $li.data("obj", trainclass);
    $li.append($goodContainer);
    $goodContainer.append($infoContainer);
    $infoContainer.append($('<div><h3>' + trainclass.name + '</h3></div>'));
    $infoContainer.append($('<div>上课时间：' + trainclass.courseTime + '</div>'));
    $infoContainer.append($('<div>上课地点：' + trainclass.schoolArea + (trainclass.classRoomName || ' (待定)') + '室</div>'));
    $infoContainer.append($('<div class="enroll-info"><p class="exam-count">已报' + trainclass.enrollCount + '&nbsp;&nbsp;共' + trainclass.totalStudentCount + '</p></div>'));
    return $li;
};