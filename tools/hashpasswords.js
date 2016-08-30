const bcrypt = require('bcrypt');
const nedb = require('nedb');

const saltRounds = 10;

const usersDb = new nedb({
	filename: 'data/users.json',
	autoload: true
});

usersDb.find({}, (err, users) => {
	users = users.map(u => {
		return {
			_id: u._id,
			plainPass: u.password,
			hashedPass: bcrypt.hashSync(u.password, saltRounds)
		};
	});

	users.forEach(u => {
		usersDb.update({ _id: u._id }, { $set: { password: u.hashedPass } });
		console.log(`Changed ${u.plainPass} to ${u.hashedPass}`);
	});
});