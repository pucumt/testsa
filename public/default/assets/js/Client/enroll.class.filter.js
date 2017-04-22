$(document).ready(function() {
    renderfilter();
    $("#page").val(1);
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

    $(".enroll-filter .glyphicon-remove-circle").on("click", function(e) {
        $(".enroll-filter").hide();
        $('.container.enroll').show();
    });
});

function renderfilter() {
    $('.enroll-filter').find("#drpGrade option").remove();
    $('.enroll-filter').find("#drpSubject option").remove();
    $.get("/enroll/schoolgradesubjectcategory", function(data) {
        if (data) {
            if (data) {
                if (data.schools.length > 0) {
                    data.schools.forEach(function(school) {
                        $(".enroll-filter #drpSchool").append("<option value='" + school._id + "'>" + school.name + "</option>");
                    });
                }
                if (data.grades.length > 0) {
                    data.grades.forEach(function(grade) {
                        $(".enroll-filter #drpGrade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
                    });
                }
                if (data.subjects.length > 0) {
                    data.subjects.forEach(function(subject) {
                        $(".enroll-filter #drpSubject").append("<option value='" + subject._id + "'>" + subject.name + "</option>");
                    });
                }
                if (data.categorys.length > 0) {
                    data.categorys.forEach(function(category) {
                        $(".enroll-filter #drpCategory").append("<option value='" + category._id + "'>" + category.name + "</option>");
                    });
                }
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
            categoryId: $('.enroll-filter #drpCategory').val()
        };
    $.post("/enroll/class?" + pStr, filter, function(data) {
        if (data && data.classs.length > 0) {
            var d = $(document.createDocumentFragment());
            data.classs.forEach(function(trainclass) {
                d.append(generateLi(trainclass));
            });
            $selectBody.append(d);
        } else {
            if (!p) {
                $('.container.enroll .row').text("即将上线");
            }
        }
        if (data.isLastPage) {
            //已经全部加载
            $("#btnMore").text("已经到最后了");
            $("#btnMore").attr("disabled", "disabled");
        }
    });
};

function generateLi(trainclass) {
    var $li = $('<li class="exam-card card " data-obj=' + JSON.stringify(trainclass) + '></li>'),
        $goodContainer = $('<div id=' + trainclass._id + ' class="exam link"></div>'),
        $infoContainer = $('<div class="exam-info"></div>');
    //$countContainer = $('<div class="info-count"></div>');

    $li.append($goodContainer);
    $goodContainer.append($infoContainer);
    //$goodContainer.append($countContainer);
    $infoContainer.append($('<div><h3>' + trainclass.name + '</h3></div>'));
    $infoContainer.append($('<div>开课日期：' + moment(trainclass.courseStartDate).format("YYYY-M-D") + '&nbsp;到&nbsp;' + moment(trainclass.courseEndDate).format("YYYY-M-D") + '</div>'));
    $infoContainer.append($('<div>上课时间：' + trainclass.courseTime + '</div>'));
    var isFull = trainclass.enrollCount == trainclass.totalStudentCount ? "<span class='full'>(已满)</span>" : "";
    $infoContainer.append($('<div class="enroll-info"><p class="exam-count">已报' + trainclass.enrollCount + '&nbsp;&nbsp;共' + trainclass.totalStudentCount + isFull + '</p><button type="button" class="btn btn-danger btn-xs">报名</button></div>'));
    //$infoContainer.append($('<div>' + trainclass.address + '</div>'));
    return $li;
};

$("#btnMore").on("click", function(e) {
    var page = parseInt($("#page").val()) + 1;
    loadData(page);
});

$selectBody.on("click", "li", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    location.href = "/enroll/class/" + entity._id;
});