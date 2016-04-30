Meteor.publish("userInfo", function() {
	if(!this.userId) {
		return this.ready();
	}

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

Meteor.publish("target", function() {
	if(!this.userId) {
		return this.ready();
	}

	var target = Meteor.users.findOne(this.userId).target;
	return Meteor.users.find(target, {
		fields: {
			"profile.name": 1
		}
	});
});

Meteor.publish("posts", function() {
	return Posts.find();
});