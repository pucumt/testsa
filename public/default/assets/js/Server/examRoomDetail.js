var isNew = true;

$(document).ready(function() {
    $("#left_btnExamroom").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    window.entity = $("#entity").data("obj");
    window.$schoolUl = $('<ul id="schoolUl"></ul>');
    render();
    $(".content.mainModal").append($schoolUl);
});

var render = function() {
    $.get("/admin/classRoomList/withoutpage", function(classRooms) {
        var school = '',
            $roomUl;
        classRooms.forEach(function(room) {
            if (school != room.schoolId) {
                $schoolLi = $('<li>' + room.schoolArea + '</li>'); //<input type="checkbox" id=' + room.schoolId + ' name=' + room.schoolId + '>
                $roomUl = $('<ul><li><span><input type="checkbox" id=' + room._id + ' name="room" value=' + room.name + '>' + room.name +
                    '</span><span class="count">人数:<input type="text" maxlength="10" name="count" id="count" value="0"></span></li></ul>');
                $schoolUl.append($schoolLi);
                $schoolLi.append($roomUl);
                school = room.schoolId;
            } else {
                $roomUl.append($('<li><span><input type="checkbox" id=' + room._id + ' name="room" value=' + room.name + '>' + room.name +
                    '</span><span class="count">人数:<input type="text" maxlength="10" name="count" id="count" value="0"></span></li>'));
            }
        });

    });
};

$("#btnSave").on("click", function(e) {
    $(":input[name='room']").each(function(index) {
        if (this.checked) {
            alert($(this).attr("id"));
        }
    })
});