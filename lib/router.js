Router.onBeforeAction(function() {
	if(!Meteor.user()) {
		if(!Meteor.loggingIn()) {
			this.redirect("login");
		}
	}
	this.next();
}, {except: ["login"]});

Router.route("/login", {
	name: "login",
	template: "login"
});

Router.route("/", {
	layoutTemplate: "dashboard",
	name: "target",
	template: "target",
	subscriptions: function() {
		return [Meteor.subscribe("userInfo"), Meteor.subscribe("userList")];
	},
	action: function() {
		if(this.ready()) {
			this.render();
		}
	}
});

Router.route("/leaderboard", {
	layoutTemplate: "dashboard",
	name: "leaderboard",
	template: "leaderboard",
	subscriptions: function() {
		return [Meteor.subscribe("userInfo"), Meteor.subscribe("userList")];
	},
	action: function() {
		if(this.ready()) {
			this.render();
		}
	}
});

Router.route("/posts", {
	layoutTemplate: "dashboard",
	name: "posts",
	template: "posts",
	subscriptions: function() {
		return [Meteor.subscribe("userInfo"), Meteor.subscribe("userList"), Meteor.subscribe("posts")];
	},
	action: function() {
		if(this.ready()) {
			this.render();
		}
	}
});