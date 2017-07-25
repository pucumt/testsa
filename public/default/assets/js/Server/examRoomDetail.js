var isNew = true;

$(document).ready(function() {
    $("#left_btnExamroom").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    window._classRooms = $("#entity").data("obj");
    window._$schoolUl = $('<ul id="schoolUl"></ul>');
    render(_$schoolUl, _classRooms);

});

var render = function(_$schoolUl, _classRooms) {
    selfAjax("get", "/admin/classRoomList/withoutpage", null, function(classRooms) {
        var school = '',
            $roomUl;
        classRooms.forEach(function(room) {
            if (school != room.schoolId) {
                $schoolLi = $('<li>' + room.schoolArea + '</li>'); //<input type="checkbox" id=' + room.schoolId + ' name=' + room.schoolId + '>
                $roomUl = $('<ul><li><span><input type="checkbox" id=' + room._id + ' name="room" value=' + room.name + '>' + room.name +
                    '</span><span class="count">人数:<input type="text" maxlength="10" name="count" id="count" value="0"></span></li></ul>');
                _$schoolUl.append($schoolLi);
                $schoolLi.append($roomUl);
                school = room.schoolId;
            } else {
                $roomUl.append($('<li><span><input type="checkbox" id=' + room._id + ' name="room" value=' + room.name + '>' + room.name +
                    '</span><span class="count">人数:<input type="text" maxlength="10" name="count" id="count" value="0"></span></li>'));
            }
        });

        $(".content.mainModal").append(_$schoolUl);

        if (_classRooms) {
            _classRooms.forEach(function(classRoom) {
                var $this = $("#" + classRoom.classRoomId);
                $this.attr("checked", true);
                $this.parent().next().find("#count").val(classRoom.examCount);
            });
        }

    });
};

$("#btnSave").on("click", function(e) {
    var classRooms = [];
    $(":input[name='room']").each(function(index) {
        if (this.checked) {
            var $this = $(this);
            classRooms.push({
                classRoomId: $this.attr("id"),
                classRoomName: $this.val(),
                examCount: $this.parent().next().find("#count").val()
            });
        }
    });

    var examRoom = {
        id: $("#id").val(),
        classRooms: JSON.stringify(classRooms)
    };
    //update entity
    selfAjax("post", "/admin/examRoom/edit", examRoom, function(examRoom) {
        if (examRoom) {
            showAlert("保存成功！");
        }
    });
});

$("#btnReturn").on("click", function(e) {
    location.href = "/admin/examRoomList";
});

$("#btnAssign").on("click", function(e) {
    var classRooms = [];
    $(":input[name='room']").each(function(index) {
        if (this.checked) {
            var $this = $(this);
            classRooms.push({
                classRoomId: $this.attr("id"),
                classRoomName: $this.val(),
                examCount: $this.parent().next().find("#count").val()
            });
        }
    });

    var examRoom = {
        id: $("#id").val(),
        classRooms: JSON.stringify(classRooms)
    };
    //update entity
    selfAjax("post", "/admin/examRoom/assign", examRoom, function(examRoom) {
        if (examRoom) {
            if (examRoom.sucess) {
                showAlert("分配成功！");
            } else {
                showAlert(examRoom.error);
            }
        }
    });
});