Template.login.events({
	"click #facebookLogin": function(e) {
		Meteor.loginWithFacebook(function(error) {
			if(error) {
				alert(error);
			}
		});
	},
	"click #googleLogin": function(e) {
		Meteor.loginWithGoogle(function(error) {
			if(error) {
				alert(error);
			}
		});
	}
});

Template.home.helpers({
	"target": function() {
		return Meteor.users.findOne(Meteor.user().target).profile.name;
	}
});

Template.home.events({
	"click #logout": function() {
		Meteor.logout(function(error) {
			if(error) {
				alert(error);
			}
		});
	}
});