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

Template.adminPanel.helpers({
	"actions": function() {
		return Actions.find({}, {sort: {"timestamp": -1}}).fetch();
	},
	"message": function() {
		var a = "Unknown";
		var m = "claims to have killed";
		var t = "Unknown";
		var assassin = Meteor.users.findOne(this.assassin);
		var target = Meteor.users.findOne(this.target);

		if(assassin) {a = assassin.profile.name;}
		if(target) {t = target.profile.name;}
		if(this.confirmed) {m = "killed";}

		return "<b>" + a + "</b> " + m + " <b>" + t + "</b>";
	}
});

Template.adminPanel.events({
	"click #startGame": function() {
		swal({
			title: "Are you sure you want to start a new game?",
			text: "This will reset all scores, empty the action log and assign new targets. Note: This is a destructive action.",
			type: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "No",
		},
		function(confirmed) {
			if(confirmed) {
				Meteor.call("startGame");
			}
		});
	}
});

Template.target.helpers({
	"target": function() {
		return Meteor.users.findOne(Meteor.user().target).profile.name;
	},
	"killTargetAvailable": function() {
		var action = Actions.find({"assassin": Meteor.userId()}, {sort: {"timestamp": -1}}).fetch()[0];
		if(!Meteor.user().alive) {
			return "disabled";
		}
		if(!action || action.confirmed) {
			return "";
		}
		else {
			return "disabled";
		}
	},
	"actions": function() {
		return Actions.find({}, {sort: {"timestamp": -1}}).fetch();
	},
	"message": function() {
		var a = "Unknown";
		var m = "claims to have killed";
		var t = "Unknown";
		var c = "";
		var assassin = Meteor.users.findOne(this.assassin);
		var target = Meteor.users.findOne(this.target);

		if(this.assassin === Meteor.userId()) {a = "You"; m = "claim to have killed";}
		else if(assassin) {a = assassin.profile.name;}

		if(this.target === Meteor.userId()) {t = "You"; c = '<br><span>Is this correct? <a href="#" class="confirmKill" style="color: green;">Yes</a> / <a href="#" class="denyKill" style="color: red;">No</a></span>';}
		else if(target) {t = target.profile.name;}
		if(this.confirmed) {m = "killed"; c = "";}
		if(this.type === "contested") {c = "<br><i>An admin will attempt to fix this as soon as possible.</i>";}

		return "<b>" + a + "</b> " + m + " <b>" + t + "</b>" + c;
	}
});

Template.target.events({
	"click #killTarget": function(e) {
		e.preventDefault();
		swal({
			title: "Are you sure?",
			type: "info",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "No",
		},
		function(confirmed) {
			if(confirmed) {
				Meteor.call("killTarget", Meteor.user().target);
			}
		});
	},
	"click .confirmKill": function(e) {
		e.preventDefault();
		Meteor.call("confirmKill", this._id);
	},
	"click .denyKill": function(e) {
		e.preventDefault();
		Meteor.call("denyKill", this._id);
	}
});

Template.leaderboard.helpers({
	"userList": function() {
		return Meteor.users.find({"inGame": true}, {sort: {"kills": -1}}).fetch();
	}
});