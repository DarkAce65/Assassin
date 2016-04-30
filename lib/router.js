Router.configure({
	"onBeforeAction": function() {
		if(Meteor.user()) {
			this.next();
		}
		else {
			this.redirect("login");
		}
	},
	"waitOn": function() {
		return [Meteor.subscribe("userInfo"), Meteor.subscribe("userList")];
	}
});

Router.route("/login", {
	"name": "login",
	"template": "login"
});

Router.route("/", {
	layoutTemplate: "dashboard",
	name: "target",
	template: "target"
});

Router.route("/leaderboard", {
	layoutTemplate: "dashboard",
	name: "leaderboard",
	template: "leaderboard",
	waitOn: function() {
		return [];
	}
});

Router.route("/posts", {
	layoutTemplate: "dashboard",
	name: "posts",
	template: "posts",
	waitOn: function() {
		return Meteor.subscribe("posts");
	}
});