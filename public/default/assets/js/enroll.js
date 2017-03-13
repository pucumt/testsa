$(".goods-list .good").on("click", function(e){
	var id = $(e.currentTarget).attr("id");
	location.href = "enrolldetail/"+id;
});