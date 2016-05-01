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
	}
});