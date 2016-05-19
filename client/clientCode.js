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
	"click #googleLogin": function(e) {
		Meteor.loginWithGoogle({"loginUrlParameters": {"hd": Meteor.settings.public.restrictedDomain}}, function(error) {
			if(error) {
				alert(error);
			}
			else {
				Router.go("target");
			}
		});
	}
});

Template.dashboard.helpers({
	"background": function() {
		if(Meteor.user() && Meteor.user().inGame && !Meteor.user().alive) {
			return {"class": "background dead"};
		}
		return {"class": "background"};
	}
});

Template.adminPanel.helpers({
	"actions": function() {
		return Actions.find({}, {sort: {"timestamp": -1}}).fetch();
	},
	"message": function() {
		var a = "Unknown";
		var t = "Unknown";
		var c = "";
		var assassin = Meteor.users.findOne(this.assassin);
		var target = Meteor.users.findOne(this.target);

		if(assassin) {a = assassin.profile.name;}
		if(target) {t = target.profile.name;}

		if(this.type === "quit") {
			return "<b>" + a + "</b> quit the game";
		}
		if(this.type === "status") {
			return this.message;
		}
		if(!this.confirmed) {
			c = '<br><span style="color: red;">Waiting for previous target to press "I Was Killed" before updating kill count</span>';
			var prevTarget = Meteor.users.findOne(assassin.target);
			if(prevTarget) {
				c = '<br><span style="color: red;">Waiting for <b>' + prevTarget.profile.name + '</b> to press "I Was Killed" before updating kill count</span>';
			}
		}

		return "<i class=\"ascii\">" + this.icon + "</i> <b>" + a + "</b> assassinated <b>" + t + "</b>" + c;
	},
	"userList": function() {
		return Meteor.users.find({}, {sort: {"alive": -1, "profile.name": 1}}).fetch();
	},
	"aliveCount": function() {
		return Meteor.users.find({"inGame": true, "alive": true}).count();
	},
	"killCount": function() {
		return Actions.find({"type": "kill", "confirmed": true}).count();
	},
	"kill24Count": function() {
		var past24 = Date.now() - 24 * 60 * 60 * 1000;
		return Actions.find({"timestamp": {$gt: past24}, "type": "kill", "confirmed": true}).count();
	},
	"playerCount": function() {
		return Meteor.users.find().count();
	},
	"statusStyle": function() {
		if(this.alive) {
			return "color: #333;";
		}
		return "color: red; text-decoration: line-through;";
	},
	"targetName": function() {
		var target = Meteor.users.findOne(this.target);
		if(target) {
			return Meteor.users.findOne(this.target).profile.name;
		}
		return "Unknown";
	},
	settings: function() {
		return {
			position: "bottom",
			limit: 8,
			rules: [
				{
					collection: Meteor.users,
					filter: {"_id": {$ne: Session.get("configureAssassin")}},
					field: "profile.name",
					template: Template.userOption
				}
			]
		};
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
			confirmButtonColor: "#d9534f",
			cancelButtonText: "No",
		},
		function(confirmed) {
			if(confirmed) {
				Meteor.call("startGame");
			}
		});
	},
	"shown.bs.modal #broadcastModal": function(e) {
		$(e.target).find("#message").focus();
	},
	"click #broadcast": function(e) {
		var input = $(e.target).closest(".modal").find("#message");
		var message = input.val();
		input.val("");
		Meteor.call("broadcast", message, function(error) {
			if(error) {
				alert(error);
			}
		});
	},
	"show.bs.modal #controlPanel": function(e) {
		var a = $(e.relatedTarget).data("assassin");
		Session.set("configureAssassin", a);
		var name = Meteor.users.findOne(a).profile.name;
		$(e.target).find("#name").val(name);
		$(e.target).find(".assassinName").text(name);
	},
	"click #changeDisplayName": function(e) {
		var input = $(e.target).closest(".modal").find("#name");
		var name = input.val();
		input.val("");
		Meteor.call("changeDisplayName", Session.get("configureAssassin"), name, function(error) {
			if(error) {
				alert(error);
			}
		});
	},
	"click #reassignTarget": function(e) {
		var input = $(e.target).closest(".modal").find("#target");
		var name = input.val();
		input.val("");
		var newTarget = Meteor.users.findOne({"profile.name": name});
		if(newTarget) {
			Meteor.call("reassignTarget", Session.get("configureAssassin"), newTarget._id, function(error) {
				if(error) {
					alert(error);
				}
			});
		}
		else {
			alert("Please pick a name from the list.");
		}
	},
	"click #forceKill": function(e) {
		var input = $(e.target).closest(".modal").find("#assassin");
		var name = input.val();
		input.val("");
		var assassin = Meteor.users.findOne({"profile.name": name});
		if(assassin) {
			Meteor.call("killed", Session.get("configureAssassin"), assassin._id, function(error) {
				if(error) {
					alert(error);
				}
			});
		}
		else {
			alert("Please pick a name from the list.");
		}
	},
	"click #forceQuit": function(e) {
		Meteor.call("quit", Session.get("configureAssassin"), function(error) {
			if(error) {
				alert(error);
			}
		});
	}
});

Template.userOption.helpers({
	"style": function() {
		if(this.alive) {
			return {};
		}
		return {style: "color: red; text-decoration: line-through;"};
	}
});

Template.target.helpers({
	"alive": function() {
		if(Meteor.user()) {
			return Meteor.user().alive;
		}
		return false;
	},
	"target": function() {
		return Meteor.users.findOne(Meteor.user().target).profile.name;
	},
	"relevantActions": function() {
		return Actions.find({
			$or: [
				{"type": "status"},
				{"assassin": Meteor.userId()},
				{"target": Meteor.userId()}
			]
		}, {sort: {"timestamp": -1}}).fetch();
	},
	"allActions": function() {
		return Actions.find({}, {sort: {"timestamp": -1}}).fetch();
	},
	"message": function() {
		var a = "Unknown";
		var t = "Unknown";
		var c = "";
		var assassin = Meteor.users.findOne(this.assassin);
		var target = Meteor.users.findOne(this.target);

		if(this.assassin === Meteor.userId()) {a = "You";}
		else if(assassin) {a = assassin.profile.name;}
		if(this.target === Meteor.userId()) {t = "You";}
		else if(target) {t = target.profile.name;}

		if(this.type === "quit") {
			return "<b>" + a + "</b> quit the game";
		}
		if(this.type === "status") {
			return this.message;
		}
		if(!this.confirmed && this.assassin === Meteor.userId()) {
			c = '<br><span style="color: red;">Waiting for previous target to press "I Was Killed" before updating kill count</span>';
			var prevTarget = Meteor.users.findOne(assassin.target);
			if(prevTarget) {
				c = '<br><span style="color: red;">Waiting for <b>' + prevTarget.profile.name + '</b> to press "I Was Killed" before updating kill count</span>';
			}
		}

		return "<i class=\"ascii\">" + this.icon + "</i> <b>" + a + "</b> assassinated <b>" + t + "</b>" + c;
	},
	settings: function() {
		return {
			position: "bottom",
			limit: 8,
			rules: [
				{
					collection: Meteor.users,
					filter: {"_id": {$ne: Meteor.userId()}},
					field: "profile.name",
					template: Template.userOption
				}
			]
		};
	}
});

Template.target.events({
	"shown.bs.modal #killModal": function(e) {
		$(e.target).find("#assassin").focus();
	},
	"click #killed": function(e) {
		var input = $(e.target).closest(".modal").find("#assassin");
		var assassinName = input.val();
		input.val("");
		var assassin = Meteor.users.findOne({"profile.name": assassinName});
		if(assassin) {
			Meteor.call("killed", Meteor.userId(), assassin._id, function(error) {
				if(error) {
					alert(error);
				}
			});
		}
		else {
			alert("Please pick a name from the list.");
		}
	},
	"click #quit": function(e) {
		Meteor.call("quit", Meteor.userId(), function(error) {
			if(error) {
				alert(error);
			}
		});
	}
});

Template.leaderboard.helpers({
	"playerCount": function() {
		return Meteor.users.find({"inGame": true, "alive": true}).count();
	},
	"userList": function() {
		return Meteor.users.find({"inGame": true}, {sort: {"kills": -1, "alive": -1, "profile.name": 1}}).fetch();
	}
});