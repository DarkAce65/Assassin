Meteor.methods({
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
	}
});