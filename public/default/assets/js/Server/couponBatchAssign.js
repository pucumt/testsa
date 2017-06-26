var isNew = true;

$(document).ready(function() {
    $("#left_btnCoupon").addClass("active");
});

$("#btnReturn").on("click", function() {
    location.href = "/admin/couponAssign/" + $('#id').val();
});


$("#InfoSearch #btnStudent").on("click", function(e) {
    var file = document.getElementById('upfile').files;
    if (file.length > 0) {
        var formData = new FormData();
        formData.append("avatar", file[0]);
        formData.append("couponId", $('#id').val());
        $.ajax({
            type: "POST",
            data: formData,
            url: "/admin/coupon/batchAssign",
            contentType: false,
            processData: false,
        }).then(function(data) {
            location.href = "/admin/score";
        });
    }
});