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