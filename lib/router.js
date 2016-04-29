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
	name: "home",
	template: "home",
	waitOn: function() {
		return [Meteor.subscribe("userInfo"), Meteor.subscribe("target")];
	}
});