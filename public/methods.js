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
			var action = Actions.findOne({"_id": actionLogId, "target": this.userId});
			if(action) {
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
});