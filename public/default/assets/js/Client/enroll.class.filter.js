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

    $(".enroll-filter .glyphicon-remove-circle")
        .on("click", function(e) {
            $(".enroll-filter").hide();
            $('.container.enroll').show();
        });

    $(".enroll-filter #drpSchool")
        .on("change", function(e) {
            changeGrades();
            changeSubjects();
            changeCategories();
        });
    $(".enroll-filter #drpGrade")
        .on("change", function(e) {
            changeSubjects();
            changeCategories();
        });
    $(".enroll-filter #drpSubject")
        .on("change", function(e) {
            changeCategories();
        });
});

var objFilters;

function renderfilter() {
    selfAjax("get", "/enroll/schoolgradesubjectcategory", null, function(data) {
        if (data) {
            if (data.error) {
                $selectBody.text(data.error);
                $(".enroll .pageTitle .filter").css({ visibility: "hidden" });
                $("#btnMore").hide();
                return;
            }
            objFilters = data;
            if (data.schools.length > 0) {
                data.schools.forEach(function(school) {
                    $(".enroll-filter #drpSchool").append("<option value='" + school._id + "'>" + school.name + "</option>");
                });
            }
            if ($("#schoolId").val() != "") {
                $(".enroll-filter #drpSchool").val($("#schoolId").val());
            }
            changeGrades();
            if ($("#gradeId").val() != "") {
                $(".enroll-filter #drpGrade").val($("#gradeId").val());
            }
            changeSubjects();
            if ($("#subjectId").val() != "") {
                $(".enroll-filter #drpSubject").val($("#subjectId").val());
            }
            changeCategories();
            if ($("#categoryId").val() != "") {
                $(".enroll-filter #drpCategory").val($("#categoryId").val());
            }

            if ($("#schoolId").val() != "") {
                loadData();
                $(".enroll-filter").hide();
                $('.container.enroll').show();
            } else {
                $(".enroll-filter").show();
                $('.container.enroll').hide();
            }
        }
    });
};

function changeGrades() {
    $('.enroll-filter').find("#drpGrade option").remove();
    if (objFilters.grades.length > 0) {
        var schoolGradeRelations = objFilters.schoolGradeRelations.filter(function(relation) {
            return relation.schoolId == $(".enroll-filter #drpSchool").val();
        });
        objFilters.grades.forEach(function(grade) {
            if (schoolGradeRelations.some(function(relation) {
                    return relation.gradeId == grade._id;
                })) {
                $(".enroll-filter #drpGrade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
            }
        });
    }
};

function changeSubjects() {
    $('.enroll-filter').find("#drpSubject option").remove();
    if (objFilters.subjects.length > 0) {
        var gradeSubjectRelations = objFilters.gradeSubjectRelations.filter(function(relation) {
            return relation.gradeId == $(".enroll-filter #drpGrade").val();
        });
        objFilters.subjects.forEach(function(subject) {
            if (gradeSubjectRelations.some(function(relation) {
                    return relation.subjectId == subject._id;
                })) {
                $(".enroll-filter #drpSubject").append("<option value='" + subject._id + "'>" + subject.name + "</option>");
            }
        });
    }
};

function changeCategories() {
    $('.enroll-filter').find("#drpCategory option").remove();
    if (objFilters.categorys.length > 0) {
        var gradeSubjectCategoryRelations = objFilters.gradeSubjectCategoryRelations.filter(function(relation) {
            return relation.subjectId == $(".enroll-filter #drpSubject").val() && relation.gradeId == $(".enroll-filter #drpGrade").val();
        });

        objFilters.categorys.forEach(function(category) {
            if (gradeSubjectCategoryRelations.some(function(relation) {
                    return relation.categoryId == category._id;
                })) {
                $(".enroll-filter #drpCategory").append("<option value='" + category._id + "'>" + category.name + "</option>");
            }
        });
    }
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
    selfAjax("post", "/enroll/class?" + pStr, filter, function(data) {
        if (data && data.classs.length > 0) {
            var d = $(document.createDocumentFragment());
            data.classs.forEach(function(trainclass) {
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
    $infoContainer.append($('<div>合计：' + (trainclass.trainPrice + trainclass.materialPrice).toFixed(2) + '元</div>'));
    var isFull = trainclass.enrollCount == trainclass.totalStudentCount ? "<span class='full'>(已满)</span>" : "";
    $infoContainer.append($('<div class="enroll-info"><p class="exam-count">已报' + trainclass.enrollCount + '&nbsp;&nbsp;共' + trainclass.totalStudentCount + isFull + '</p><button type="button" class="btn btn-primary btn-xs">报名</button></div>'));
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