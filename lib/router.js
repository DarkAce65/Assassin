Router.configure({
	"onBeforeAction": function() {
		if(Meteor.user()) {
			this.next();
		}
		else {
			this.render("login");
		}
	},
	"waitOn": function() {
		return Meteor.subscribe("userInfo");
	}
});

Router.route("/login", {
	"name": "login",
	"template": "login"
});

Router.route("/", {
	layoutTemplate: "dashboard",
	name: "target",
	template: "target",
	waitOn: function() {
		return Meteor.subscribe("target");
	}
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
		return [Meteor.subscribe("userList"), Meteor.subscribe("posts")];
	}
});