Accounts.onCreateUser(function(options, user) {
	user.admin = false;
	user.inGame = false;

	if(options.profile) {
		user.profile = options.profile;
	}

	return user;
});

Meteor.publish("userInfo", function() {
	return Meteor.users.find(this.userId, {
		fields: {
			"admin": 1,
			"inGame": 1,
			"alive": 1,
			"target": 1,
			"assassinations": 1
		}
	});
});

Meteor.publish("userList", function() {
	return Meteor.users.find({}, {
		fields: {
			"profile.name": 1
		}
	});
});

Meteor.publish("posts", function() {
	return Posts.find();
});