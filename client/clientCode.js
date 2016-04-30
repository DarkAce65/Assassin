Template.registerHelper("activeRoute", function(route) {
	var currentRoute = Router.current().route.getName();
	return currentRoute === route ? " active" : "";
});

Template.navigation.events({
	"click #logout": function(e) {
		Meteor.logout(function(error) {
			if(error) {
				alert(error);
			}
			else {
				Router.go("login");
			}
		});
	}
});

Template.login.events({
	"click #facebookLogin": function(e) {
		Meteor.loginWithFacebook(function(error) {
			if(error) {
				alert(error);
			}
			else {
				Router.go("target");
			}
		});
	},
	"click #googleLogin": function(e) {
		Meteor.loginWithGoogle(function(error) {
			if(error) {
				alert(error);
			}
			else {
				Router.go("target");
			}
		});
	}
});

Template.target.helpers({
	"target": function() {
		return Meteor.users.findOne(Meteor.user().target).profile.name;
	}
});

Template.target.events({
	"click #logout": function() {
		Meteor.logout(function(error) {
			if(error) {
				alert(error);
			}
			else {
				Router.go("login");
			}
		});
	}
});

Template.leaderboard.helpers({
	"userList": function() {
		return Meteor.users.find({"inGame": true}, {sort: {"kills": -1}}).fetch();
	}
});