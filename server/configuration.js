Accounts.onCreateUser(function(options, user) {
	user.inGame = false;

	if(options.profile) {
		user.profile = options.profile;
	}

	return user;
});

Meteor.publish("adminInfo", function() {
	if(!Roles.userIsInRole(this.userId, "admin")) {
		this.ready();
	}

	return [
		Meteor.users.find({}, {
			fields: {
				"alive": 1,
				"inGame": 1,
				"kills": 1,
				"assassin": 1,
				"target": 1,
				"profile.name": 1
			}
		}),
		Actions.find()
	];
});

Meteor.publish("target", function() {
	return Meteor.users.find(this.userId, {
		fields: {
			"target": 1
		}
	});
});

Meteor.publish("userList", function() {
	return Meteor.users.find({"inGame": true}, {
		fields: {
			"alive": 1,
			"inGame": 1,
			"kills": 1,
			"profile.name": 1
		}
	});
});

Meteor.publish("actions", function() {
	return Actions.find({
		$or: [
			{"assassin": this.userId},
			{"target": this.userId}
		]
	});
});

Meteor.publish("posts", function() {
	return Posts.find();
});