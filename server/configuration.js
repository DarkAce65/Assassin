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

Meteor.publish("target", function() {
	var target = Meteor.users.findOne(this.userId).target;
	return Meteor.users.find(target, {
		fields: {
			"profile.name": 1
		}
	});
});