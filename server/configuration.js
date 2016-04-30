Meteor.publish("userInfo", function() {
	return Meteor.users.find(this.userId, {
		fields: {
			"admin": 1,
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