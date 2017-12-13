const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Event} = require('./../models/event');
const {User} = require('./../models/user');

const {events, populateEvents, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateEvents);

describe('POST /events', () => {
    it('should create a new Event', (done) => {
        var title = "test event";

        request(app)
            .post('/events')
            .set('x-auth', users[0].tokens[0].token)
            .send({title})
            .expect(200)
            .expect((res) => {
                expect(res.body.title).toBe(title);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Event.find({title}).then((events) => {
                    expect(events.length).toBe(1);
                    expect(events[0].title).toBe(title);
                    done();
                }).catch((err) => done(e));
            });
    });

    it('should not create event with invalid body data', (done) => {
        request(app)
            .post('/events')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err) {
                    return done(err);
                }

                Event.find().then((events) => {
                    expect(events.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /events', () => {
    it('should get all events', (done) => {
        request(app)
            .get('/events')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.events.length).toBe(2 );
            })
            .end(done);
    });
});

describe('GET /events/:id', () => {
    it('should return event doc', (done) => {
        request(app)
            .get(`/events/${events[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.event.title).toBe(events[0].title);
            }).end(done);
    });

    // it('should not return event doc created by other user', (done) => {
    //     request(app)
    //         .get(`/events/${events[1]._id.toHexString()}`)
    //         .set('x-auth', users[0].tokens[0].token)
    //         .expect(404)
    //         .end(done);
    // });

    it('should return a 404 if event not found', (done) => {
        var id = new ObjectID().toHexString();
        request(app)
            .get(`/events/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non object ids', (done) => {
        request(app)
        .get(`/events/123`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('DELETE /events/:id', () => {
    it('should remove an event', (done) =>{
        var id = events[1]._id.toHexString();

        request(app)
            .delete(`/events/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.event._id).toBe(id);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Event.findById(id).then( (event) => {
                    expect(event).toBeFalsy();
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should return a 404 if event not found', (done) => {
        var id = new ObjectID().toHexString();
        request(app)
            .delete(`/events/${id}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if ObjectID is invalid', (done)=>{
        request(app)
        .delete(`/events/123`)
        .expect(404)
        .end(done);
    });
})

describe('PATCH /events:id', () => {
    it('should update the event', (done) => {
        var id = events[0]._id.toHexString();
        var title = "updated title";

        request(app)
            .patch(`/events/${id}`)
            .send({
                title,
                details: "suh dude"
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.event.title).toBe(title);
                expect(res.body.event.details).toBe("suh dude");
            })
            .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'test@test.org';
        var password = 'password';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return validation errors if request invalid', (done) => {
        request(app)
            .post('/users')
            .send({
                email: 'bademail',
                password: '1'
            })
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        request(app)
            .post('/users')
            .send({
                email: users[0].email,
                password: 'password'
            })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            });
    })

    it('should reject invalid login', (done) => {
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: 'ayylmao'
        })
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toBeFalsy();
        })
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            User.findById(users[1]._id).then((user) => {
                expect(user.toObject().tokens.length).toBe(1);
                done();
            }).catch((e) => done(e));
        });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)  
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            User.findById(users[0]._id).then((user) => {
                expect(user.toObject().tokens.length).toBe(0);
                done();
            }).catch((e) => done(e));
        });
    });
});