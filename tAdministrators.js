const ObjectId = require('mongodb').ObjectID
const Express = require('express')
const Passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Session = require('express-session')

module.exports = (db) => {

    function authenticated (request, response, next) {
        //console.log('authenticated ---> '+ request.isAuthenticated());
        if (request.isAuthenticated()) {
            return next()
        }
        response.send(false)
    }

    function verifyPassword (passwordA, passwordB) {
        if (passwordA === passwordB) {
            return true
        } else {
            return false
        }
    }

	const router = Express.Router()
    
    router.use(Session({
		secret: 'tsystem',
		resave: true,
		saveUninitialized: true
	}))
	router.use(Passport.initialize())
    router.use(Passport.session())
    
    Passport.serializeUser((user, done) => {
		done(null, user._id)
		//console.log('serializeUser ---> '+ user._id)
	})

	Passport.deserializeUser((_id, done) => {
		db.collection('tAdministrators').findOne({_id:new ObjectId(_id)}, (error, user) => {
			done(null, user)
		})
		//console.log('deserializeUser ---> '+ _id)
	})

	Passport.use(new LocalStrategy(
		{
			usernameField: 'username',
			passwordField: 'password'
		},
		async (username, password, done) => {
			try {
				let account = await db.collection('tAdministrators').findOne({username:username})
				if (!account) {
					//console.log('Incorrect Username')
					return done(null, false, { message: 'Incorrect username.' })
				}
				if (!verifyPassword(account.password, password)) {
					//console.log('Incorrect Password')
					return done(null, false, { message: 'Incorrect password.' })
				}
				return done(null, account)
			} catch (err) {
				return done(err)
			}
		}
	))
	
	router.post('/authorize', authenticated, (request, response) => {
        response.send(request.user)
	})

	router.post('/sign_in', Passport.authenticate('local'), (request, response) => {
		response.send(request.user)
    })

    router.post('/sign_out', (request, response) => {
        request.logout()
        response.send('sign_out')
	})

 	return router
}