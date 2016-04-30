Accounts.onCreateUser(function(options, user) {
	user.inGame = false;

	if(options.profile) {
		user.profile = options.profile;
	}

	return user;
});

Meteor.publish("userInfo", function() {
	return Meteor.users.find(this.userId, {
		fields: {
			"inGame": 1,
			"alive": 1,
			"target": 1,
			"kills": 1
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