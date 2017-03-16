var isNew = true;

$("#btnAdmin").addClass("active");

$("#btnAdd").on("click", function(e) {
    isNew = true;
    $('#myModalLabel').text("新增");
    $('#user-name').val("");
    $('#user-pwd').val("");
    $('#myModal').modal('show');
});

$("#btnSave").on("click", function(e) {
    if (isNew) {
        $.post("/admin/user/add", {
            username: $('#user-name').val(),
            password: hex_md5($('#user-pwd').val())
        }, function(data) {
            $('#myModal').modal('hide');
        });
    } else {
        $.post("/admin/user/edit", {
            username: $('#user-name').val(),
            password: hex_md5($('#user-pwd').val())
        }, function(data) {
            $('#myModal').modal('hide');
        });
    }
});

$("#gridBody").on("click", "td .btnEdit", function(e) {
    isNew = false;
    var obj = e.currentTarget;
    $('#myModalLabel').text("修改");
    $('#user-name').val($(obj).attr("data"));
    $('#user-pwd').val("");
    $('#myModal').modal('show');
});