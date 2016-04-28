var services = Meteor.settings.private.oAuth;

if(services) {
	for(var service in services) {
		ServiceConfiguration.configurations.upsert({"service": service}, {
			$set: services[service]
		});
	}
}
else {
	throw new Meteor.Error("bad-oauth-configuration", "No services defined");
}