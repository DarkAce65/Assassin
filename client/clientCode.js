Template.registerHelper("activeRoute", function(route) {
	var currentRoute = Router.current().route.getName();
	return currentRoute === route ? " active" : "";
});

Template.registerHelper("calendarTime", function(date) {
	if(date) {
		return moment(date).calendar();
	}
	return "Unknown";
});

Template.registerHelper("equals", function(a, b) {
	return a === b;
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
	},
	"actions": function() {
		return Actions.find().fetch();
	},
	"message": function() {
		var a = "Unknown";
		var m = "claims to have killed";
		var t = "Unknown";
		var assassin = Meteor.users.findOne(this.assassin);
		var target = Meteor.users.findOne(this.target);

		if(this.assassin === Meteor.userId()) {a = "You"; m = "claim to have killed";}
		else if(assassin) {a = assassin.profile.name;}

		if(this.target === Meteor.userId()) {t = "You";}
		else if(target) {t = target.profile.name;}
		if(this.confirmed) {m = "killed";}

		return "<b>" + a + "</b> " + m + " <b>" + t + "</b>";
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