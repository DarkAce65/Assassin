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
			Roles.addUsersToRoles(this.userId, "admin");
		}
	},
	"assignRandomTargets": function() {
		if(!this.userId) {
			throw new Meteor.Error(401, "You are not logged in.");
		}
		if(!Roles.userIsInRole(this.userId, "admin")) {
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
		if(!this.userId) {
			throw new Meteor.Error(401, "You are not logged in.");
		}
		if(!Roles.userIsInRole(this.userId, "admin")) {
			throw new Meteor.Error(401, "You are not authorized to start the game.");
		}
		Meteor.call("assignRandomTargets");
		Actions.remove({});
		Meteor.users.update({}, {
			$set: {
				"inGame": true,
				"alive": true,
				"kills": 0
			}
		}, {multi: true});
	},
	"killTarget": function(targetId) {
		if(targetId) {
			if(!Actions.findOne({"assassin": this.userId, "target": targetId})) {
				Actions.insert({
					"timestamp": Date.now(),
					"type": "kill",
					"confirmed": false,
					"assassin": this.userId,
					"target": targetId
				});
			}
		}
	},
	"confirmKill": function(actionLogId) {
		if(actionLogId) {
			var action = Actions.findOne({"_id": actionLogId, "assassin": {$ne: this.userId}});
			if(action) {
				if(action.target !== this.userId && !Roles.userIsInRole(this.userId, "admin")) {
					throw new Meteor.Error(401, "You are not authorized to rule this action.");
				}
				Actions.update(actionLogId, {
					$set: {"confirmed": true}
				});
				Meteor.users.update(action.assassin, {
					$inc: {"kills": 1},
					$set: {"target": Meteor.users.findOne(action.target).target}
				});
				Meteor.users.update(action.target, {
					$set: {"alive": false}
				});
			}
		}
	},
	"denyKill": function(actionLogId) {
		if(actionLogId) {
			var action = Actions.findOne({"_id": actionLogId, "target": this.userId});
			if(action) {
				Actions.update(actionLogId, {
					$set: {"type": "contested"}
				});
			}
		}
	},
	"ruleTarget": function(actionLogId) {
		if(!Roles.userIsInRole(this.userId, "admin")) {
			throw new Meteor.Error(401, "You are not authorized to rule this action.");
		}
		if(actionLogId) {
			Actions.remove(actionLogId);
		}
	}
});