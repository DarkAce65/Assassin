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
	"setupGame": function() {
		var userIdList = Meteor.users.find({}, {fields: {"_id": 1}}).fetch().map(function(value) {
			return value._id;
		});
		shuffle(userIdList);

		for(var i = 0; i < userIdList.length; i++) {
			var shift = (i + 1) % userIdList.length;
			Meteor.users.update(userIdList[i], {
				$set: {
					"admin": false,
					"assassinations": 0,
					"killed": false,
					"target": userIdList[shift]
				}
			});
		}
	}
});