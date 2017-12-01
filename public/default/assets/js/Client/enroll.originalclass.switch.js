$(document).ready(function () {
    renderfilter();
    $("#page").val(1);
    $(".enroll-filter .btn-search")
        .on("click", function (e) {
            $('.enroll .exam-list').empty();
            loadData();
            $('.enroll-filter').hide();
            $('.container.enroll').show();
        });

    $(".enroll .pageTitle .filter")
        .on("click", function (e) {
            $('.enroll-filter').show();
            $('.container.enroll').hide();
        });

    $(".enroll-filter .glyphicon-remove-circle")
        .on("click", function (e) {
            $(".enroll-filter").hide();
            $('.container.enroll').show();
        });

    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/enrolloriginalclass";
    });
});

function renderfilter() {
    selfAjax("post", "/enroll/getSchoolsAndOrder", {
        orderId: $("#orderId").val()
    }, function (data) {
        if (data) {
            if (data.schools.length > 0) {
                data.schools.forEach(function (school) {
                    $(".enroll-filter #drpSchool").append("<option value='" + school._id + "'>" + school.name + "</option>");
                });
            }
            if (data.categories.length > 0) {
                data.categories.forEach(function (category) {
                    $(".enroll-filter #drpCategory").append("<option value='" + category._id + "'>" + category.name + "</option>");
                });
            }

            $(".enroll-filter #drpGrade").append("<option value='" + data.gradeId + "'>" + data.gradeName + "</option>");
            $(".enroll-filter #drpSubject").append("<option value='" + data.subjectId + "'>" + data.subjectName + "</option>");
            if ($("#schoolId").val() != "") {
                $(".enroll-filter #drpSchool").val($("#schoolId").val());
                $(".enroll-filter #drpCategory").val($("#categoryId").val());
            } else {
                $(".enroll-filter #drpSchool").val(data.schoolId);
                $(".enroll-filter #drpCategory").val(data.categoryId);
            }
            $("#studentId").val(data.studentId);
            if ($("#schoolId").val() != "") {
                loadData();
                $(".enroll-filter").hide();
                $('.container.enroll').show();
            } else {
                $(".enroll-filter").show();
                $('.container.enroll').hide();
            }

            if (data.classAttributes.length > 0) {
                data.classAttributes.forEach(function (classAttribute) {
                    if (classAttribute.name != "寒假班") {
                        $(".enroll-filter #drpAttribute").append("<option value='" + classAttribute._id + "'>" + classAttribute.name + "</option>");
                    }
                });
            } else {
                $('.container.enroll-filter .attribute').hide();
            }
        }
    });
};

var $selectBody = $('.container.enroll .exam-list');

function loadData(p) {
    var pStr = p ? "p=" + p : "",
        filter = {
            schoolId: $('.enroll-filter #drpSchool').val(),
            gradeId: $('.enroll-filter #drpGrade').val(),
            subjectId: $('.enroll-filter #drpSubject').val(),
            categoryId: $('.enroll-filter #drpCategory').val(),
            attributeId: $('.enroll-filter #drpAttribute').val()
        };
    selfAjax("post", "/enroll/originalclass/switch?" + pStr, filter, function (data) {
        if (data && data.classs.length > 0) {
            var d = $(document.createDocumentFragment());
            data.classs.forEach(function (trainclass) {
                d.append(generateLi(trainclass));
            });
            $selectBody.append(d);
            $("#btnMore").show();
        } else {
            if (!p) {
                $selectBody.text("即将上线");
                $("#btnMore").hide();
                return;
            }
        }
        if (data.isLastPage) {
            //已经全部加载
            $("#btnMore").text("已经到最后了");
            $("#btnMore").attr("disabled", "disabled");
        }
        if (p) {
            $("#page").val(p);
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
    //$goodContainer.append($countContainer);
    $infoContainer.append($('<div><h3>' + trainclass.name + '</h3></div>'));
    $infoContainer.append($('<div>开课日期：' + moment(trainclass.courseStartDate).format("YYYY-M-D") + '&nbsp;到&nbsp;' + moment(trainclass.courseEndDate).format("YYYY-M-D") + '&nbsp;共' + trainclass.totalClassCount + '课时</div>'));
    $infoContainer.append($('<div>上课时间：' + trainclass.courseTime + '</div>'));
    $infoContainer.append($('<div>上课地点：' + trainclass.schoolArea + (trainclass.classRoomName || ' (待定)') + '室</div>'));
    $infoContainer.append($('<div>培训费：' + trainclass.trainPrice + '元</div>'));
    $infoContainer.append($('<div>教材费：' + trainclass.materialPrice + '元</div>'));
    $infoContainer.append($('<div>合计：' + (parseFloat(trainclass.trainPrice) + parseFloat(trainclass.materialPrice)).toFixed(2) + '元</div>'));
    $infoContainer.append($('<div class="enroll-info"><button type="button" class="btn btn-primary btn-xs">报名</button></div>'));
    //$infoContainer.append($('<div>' + trainclass.address + '</div>'));
    return $li;
};

$("#btnMore").on("click", function (e) {
    var page = parseInt($("#page").val()) + 1;
    loadData(page);
});

$selectBody.on("click", "li", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    location.href = location.href = "/enroll/originalclass/id/" + entity._id + "/student/" + $('#studentId').val() + "?orderId=" + $("#orderId").val();
});