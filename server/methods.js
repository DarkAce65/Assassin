function shuffle(array) { // Fisher–Yates Shuffle
	var m = array.length, t, i;
	while(m) {
		i = Math.floor(Math.random() * m--);
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
	return array;
}

Meteor.methods({
	"makeAdmin": function(password) {
		if(this.userId && password === Meteor.settings.private.adminPassword) {
			Meteor.users.update(this.userId, {
				$set: {
					"admin": true
				}
			});
		}
	},
	"assignRandomTargets": function() {
		if(!this.userId) {
			throw new Meteor.Error(401, "You are not logged in.");
		}
		if(!Meteor.users.findOne(this.userId).admin) {
			throw new Meteor.Error(401, "You are not authorized to start the game.");
		}
		var userIdList = Meteor.users.find({}, {fields: {"_id": 1}}).fetch().map(function(value) {
			return value._id;
		});
		shuffle(userIdList);

		for(var i = 0; i < userIdList.length; i++) {
			var assassinId = userIdList[i];
			var userId = userIdList[(i + 1) % userIdList.length];
			var targetId = userIdList[(i + 2) % userIdList.length];
			Meteor.users.update(userId, {
				$set: {
					"assassin": assassinId,
					"target": targetId
				}
			});
		}
	},
	"startGame": function() {
		Meteor.call("assignRandomTargets");
		Meteor.users.update({}, {
			$set: {
				"inGame": true,
				"alive": true,
				"assassinations": 0
			}
		}, {multi: true});
	}
});