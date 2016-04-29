Template.login.events({
	"click #googleLogin": function(e) {
		Meteor.loginWithGoogle(function(error) {
			if(error) {
				alert(error);
			}
		});
	},
	"click #facebookLogin": function(e) {
		Meteor.loginWithFacebook(function(error) {
			if(error) {
				alert(error);
			}
		});
	}
});