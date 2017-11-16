$(document).ready(function () {
	$('#regForm').formValidation({
		declarative: false,
		// List of fields and their validation rules
		fields: {
			name: {
				trigger: "blur change",
				validators: {
					notEmpty: {
						message: 'The username is required and cannot be empty'
					},
					stringLength: {
						min: 5,
						max: 30,
						message: 'The username must be more than 5 and less than 20 characters long'
					},
					regexp: {
						regexp: /^[a-zA-Z0-9_]+$/,
						message: 'The username can only consist of alphabetical, number and underscore'
					}
				}
			},
			password: {
				trigger: "blur change",
				validators: {
					notEmpty: {
						message: 'The password is required and cannot be empty'
					}
				}
			}
		}
	});
});