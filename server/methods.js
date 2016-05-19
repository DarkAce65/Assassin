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
		Meteor.users.update({}, {
			$set: {
				"inGame": true,
				"alive": true,
				"kills": 0
			}
		}, {multi: true});
		Meteor.call("assignRandomTargets");
		Actions.remove({});
		Actions.insert({
			"timestamp": Date.now(),
			"type": "status",
			"message": "The game of Assassin has begun. Watch your back."
		});
	},
	"broadcast": function(message) {
		if(!this.userId) {
			throw new Meteor.Error(401, "You are not logged in.");
		}
		if(!Roles.userIsInRole(this.userId, "admin")) {
			throw new Meteor.Error(401, "You are not authorized to broadcast messages.");
		}
		Actions.insert({
			"timestamp": Date.now(),
			"type": "status",
			"message": message
		});
	},
	"killed": function(userId, assassinId) {
		if(!this.userId) {
			throw new Meteor.Error(401, "You are not logged in.");
		}
		if(this.userId !== userId && !Roles.userIsInRole(this.userId, "admin")) {
			throw new Meteor.Error(401, "You are not authorized to kill others.");
		}
		var user = Meteor.users.findOne(userId);
		if(!user) {
			throw new Meteor.Error(404, "User not found.");
		}
		if(!user.inGame) {
			throw new Meteor.Error(401, "User is not in the game.");
		}
		if(!user.alive) {
			throw new Meteor.Error(401, "User is not alive.");
		}
		var assassin = Meteor.users.findOne(assassinId);
		if(!assassin) {
			throw new Meteor.Error(404, "Assassin not found.");
		}
		if(!assassin.inGame) {
			throw new Meteor.Error(400, "Assassin is not in the game.");
		}
		if(Actions.findOne({"target": userId})) {
			throw new Meteor.Error(400, "An action item targeting this user already exists.");
		}

		if(assassin.target === userId) {
			var icons = ["︻╦╤──", "︻デ═一", "▬ι═══ﺤ"];
			Actions.insert({
				"timestamp": Date.now(),
				"type": "kill",
				"icon": icons[Math.floor(Math.random() * icons.length)],
				"assassin": user.assassin,
				"target": user._id
			});
			do {
				Actions.update({"target": user._id}, {
					$set: {"confirmed": true}
				});
				Meteor.users.update(user.assassin, {
					$set: {"target": user.target},
					$inc: {"kills": 1}
				});
				Meteor.users.update(user._id, {
					$set: {"alive": false}
				});
				Meteor.users.update(user.target, {
					$set: {"assassin": user.assassin}
				});
				user = Meteor.users.findOne(user.target);
			} while(Actions.findOne({"confirmed": false, "target": user._id}));
		}
		else {
			var icons = ["︻╦╤──", "︻デ═一", "▬ι═══ﺤ"];
			Actions.insert({
				"timestamp": Date.now(),
				"type": "kill",
				"confirmed": false,
				"icon": icons[Math.floor(Math.random() * icons.length)],
				"assassin": assassinId,
				"target": userId
			});
			Meteor.users.update(userId, {
				$set: {"alive": false}
			});
		}
	},
	"quit": function(userId) {
		if(!this.userId) {
			throw new Meteor.Error(401, "You are not logged in.");
		}
		if(this.userId !== userId && !Roles.userIsInRole(this.userId, "admin")) {
			throw new Meteor.Error(401, "You are not authorized to force-quit others.");
		}
		var user = Meteor.users.findOne(userId);
		if(!user) {
			throw new Meteor.Error(404, "User not found.");
		}
		if(!user.inGame) {
			throw new Meteor.Error(401, "User is not in the game.");
		}
		if(!user.alive) {
			throw new Meteor.Error(401, "User is not alive.");
		}
		if(Actions.findOne({"target": userId})) {
			throw new Meteor.Error(400, "An action item targeting this user already exists.");
		}

		Actions.insert({
			"timestamp": Date.now(),
			"type": "quit",
			"assassin": userId
		});
		Meteor.users.update(user.assassin, {
			$set: {"target": user.target}
		});
		Meteor.users.update(userId, {
			$set: {"alive": false}
		});
		Meteor.users.update(user.target, {
			$set: {"assassin": user.assassin}
		});
		while(Actions.findOne({"confirmed": false, "target": user.target})) {
			user = Meteor.users.findOne(user.target);
			Actions.update({"target": user._id}, {
				$set: {"confirmed": true}
			});
			Meteor.users.update(user.assassin, {
				$set: {"target": user.target},
				$inc: {"kills": 1}
			});
			Meteor.users.update(user._id, {
				$set: {"alive": false}
			});
			Meteor.users.update(user.target, {
				$set: {"assassin": user.assassin}
			});
		}
	},
	"changeDisplayName": function(userId, name) {
		if(this.userId !== userId && !Roles.userIsInRole(this.userId, "admin")) {
			throw new Meteor.Error(401, "You are not authorized to change other people's display names.");
		}
		if(userId && name) {
			if(!Meteor.users.findOne(userId)) {
				throw new Meteor.Error(404, "User not found.");
			}
			Meteor.users.update(userId, {$set: {"profile.name": name}});
		}
	},
	"reassignTarget": function(assassin, target) {
		if(!Roles.userIsInRole(this.userId, "admin")) {
			throw new Meteor.Error(401, "You are not authorized to reassign targets.");
		}
		if(assassin && target) {
			if(!Meteor.users.findOne(assassin)) {
				throw new Meteor.Error(404, "Assassin not found.");
			}
			if(!Meteor.users.findOne(target)) {
				throw new Meteor.Error(404, "Target not found.");
			}
			if(!Meteor.users.findOne(target).inGame) {
				throw new Meteor.Error(400, "Target is not in the game.");
			}
			Meteor.users.update(assassin, {$set: {"target": target}});
			Meteor.users.update(target, {$set: {"assassin": assassin}});
		}
	}
});
