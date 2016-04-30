Router.configure({
	"onBeforeAction": function() {
		if(Meteor.user()) {
			this.next();
		}
		else {
			this.render("login");
		}
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
		return [Meteor.subscribe("userInfo"), Meteor.subscribe("target")];
	}
});