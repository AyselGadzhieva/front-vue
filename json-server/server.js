const fs = require('fs')
const bodyParser = require('body-parser')
const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')
const url = require("url");
const path = require("path");

const server = jsonServer.create()
const router = jsonServer.router('./json-server/db.json')

server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.json())

server.use(jsonServer.defaults());

const SECRET_KEY = '123456789'

const expiresInAccess = '1d'

const expiresInRefresh = '7d'

// Создание токена
function createToken(payload, secret, life){
    return jwt.sign(payload, secret, {expiresIn: life})
}

// Верификация токена
function verifyToken(token){
    return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ?  decode : err)
}

// Проверка существования пользователя
function isAuthenticated({email, password}){
    const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
    return userdb.users.findIndex(user => user.email === email && user.password === password) !== -1
}

// Регистрация партнера
server.post('/api/register', (req, res) => {
    const {email, password, surname, name, patronymic, organization, phone} = req.body;

    fs.readFile("./json-server/db-users.json", (err, data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        };

        // Получить пользователей
        data = JSON.parse(data.toString());

        if(data.users.find(user => user.phone === phone) || data.users.find(user => user.email === email)) {
            const status = 409;
            const message = 'Такой телефон или email уже есть в системе';
            res.status(status).json({status, message});
            return
        }

        // Получить последний id
        const id = data.users[data.users.length-1].id + 1;
        const roles = [{"name": "partner"}];

        // Добавить пользователя
        data.users.push({
            id: id,
            email: email,
            password: password,
            roles: roles,
            surname: surname,
            name: name,
            patronymic: patronymic,
            organization: organization,
            phone: phone
        });
        var writeData = fs.writeFile("./json-server/db-users.json", JSON.stringify(data), (err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const token = createToken({id, roles}, SECRET_KEY, expiresInAccess);
        const refreshToken = createToken({id, roles}, SECRET_KEY, expiresInRefresh);
        const status = 'success';
        res.status(201).json({status, authorization: {token, refreshToken, type: 'bearer'}});
    });
})

// Вход в систему
server.post('/api/login', (req, res) => {
    const {email, password} = req.body;
    if (isAuthenticated({email, password}) === false) {
        const status = 401
        const message = 'Incorrect email or password'
        res.status(status).json({status, message})
        return
    }
    const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
    const user = userdb.users.find(user => user.email === email);
    const id = user.id;
    const roles = user.roles;
    const token = createToken({id, roles}, SECRET_KEY, expiresInAccess);
    const refreshToken = createToken({id, roles}, SECRET_KEY, expiresInRefresh);
    const status = 'success';
    res.status(200).json({status, authorization: {token, refreshToken, type: 'bearer'}});
})

server.post('/api/refresh', (req, res) => {
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let refreshtoken = req.headers.authorization.replace('Bearer ', '');
        let verifyTokenResult;
        verifyTokenResult = jwt.verify(refreshtoken, SECRET_KEY);

        if (verifyTokenResult instanceof Error) {
            const status = 403
            const message = 'Refresh token not provided'
            res.status(status).json({status, message})
            return
        }

        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        const user = userdb.users.find(user => user.id === verifyTokenResult.id);
        const id = user.id;
        const roles = user.roles;
        const token = createToken({id, roles});
        const status = 'success';
        res.status(200).json({status, authorization: {token, type: 'bearer'}});
    } catch (err) {
        const status = 401
        const message = 'Error refreshToken is revoked'
        res.status(status).json({status, message})
    }
})

server.get('/api/projects',(req,res) => {
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        let data = JSON.parse(file_data.toString());
        let statuses = ['Набор участников', 'Команда собрана', 'В процессе', 'В архиве', 'Завершён']
        let projects = []
        if (data.projects?.length !== 0)
        {
            projects = data.projects.filter(project => statuses.includes(project.status));
        }
        res.status(200).json(projects);
    });
})

server.get('/api/project-form-info',(req,res) => {
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        let data = JSON.parse(file_data.toString());
        res.status(200).json({subject_areas: data.subject_areas, roles: data.roles});
    });
})

server.get('/api/projects/:id',(req,res) => {
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        res.status(200).json(data.projects[id_project]);
    });
})

server.get('/api/projects/edit/:id',(req,res) => {
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        res.status(200).json(data.projects[id_project]);
    });
})

server.get('/api/projects/:id/expertise-info',(req,res) => {
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        res.status(200).json(data.projects[id_project].expertise);
    });
})

server.get('/api/projects/:id/team-info',(req,res) => {
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        res.status(200).json({
            teams: data.projects[id_project].team,
            project_roles: data.projects[id_project].project_roles,
            status: data.projects[id_project].status
        });
    });
})

server.get('/api/projects/:id/team-available-roles',(req,res) => {
    var user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);
        const team = data.projects[id_project].team.find(t => t.curator?.id === user.id)

        res.status(200).json({
            team: team.students.filter(student => student.student === null),
            project_roles: data.projects[id_project].project_roles
        });
    });
})

server.get('/api/moderation',(req,res) => {
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const projects_req = data.projects.filter(project => project.status === 'Отправлена заявка' );

        res.status(200).json(projects_req);
    });
})

server.get('/api/moderation/my-requests',(req,res) => {
    var user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const moderator_req = data.projects.filter(project => project.moderator?.id === user.id);

        res.status(200).json(moderator_req);
    });
})

server.get('/api/expertise/requests',(req,res) => {
    var user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const expertise_req = data.projects.filter(project => project.expertise?.find(expert => expert.expert.id === user.id));

        res.status(200).json(expertise_req);
    });
})

server.get('/api/curation',(req,res) => {
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const projects_req = data.projects.filter(project => project.status === 'Отправлен кураторам' );

        res.status(200).json(projects_req);
    });
})

server.get('/api/curation/my-projects',(req,res) => {
    var user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const projects = data.projects.filter(project => project.team?.find(team => team.curator?.id === user.id) );

        res.status(200).json(projects);
    });
})

server.get('/api/user_profile', (req, res) => {
    var user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    const email = user.email;
    const surname = user.surname;
    const name = user.name;
    const patronymic = user.patronymic;
    let organization = '';
    let specialty = null;
    let group = null;
    let institute = null;
    if(user.organization) {
        organization = user.organization;
    }
    if(user.institute) {
        institute = user.institute;
    }
    if(user.specialty) {
        specialty = user.specialty;
    }
    if(user.group) {
        group = user.group;
    }
    const phone = user.phone;
    res.status(200).json({ email, surname, name, patronymic, organization, phone, institute, specialty, group });
})

server.get('/api/user_profile/my-projects',(req,res) => {
    var user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const projects = data.projects.filter(project => project.owner.id === user.id);

        res.status(200).json(projects);
    });

})

server.get('/api/user_profile/projects',(req,res) => {
    var user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }
        // Get current projects data
        var data = JSON.parse(file_data.toString());
        const projects = data.projects.filter(project => (project.owner.id === user.id
            || project.moderator?.id === user.id
            || project.experts?.find(expert => expert?.id === user.id)
            || project.team?.find(team => (team.curator?.id === user.id || team.students?.find(student => student.student?.id === user.id)))
            || project.project_roles.find(role => role.subscribes?.find(subscribe => subscribe.id === user.id))));

        res.status(200).json(projects);
    });

})

server.get('/api/subject-area/:id/experts',(req,res) => {
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        var data = JSON.parse(file_data.toString());
        const id = parseInt(req.params.id);
        const experts = data.experts?.filter(project => project?.moderator.id === user.id);

        res.status(200).json(moderator_req);
    });
})

server.get('/api/experts',(req,res) => {
    const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));

    let experts = []
    userdb.users.forEach(expert => {
        const index = expert.roles.findIndex(role => role.name === 'expert');
        if(index > -1) {
            experts.push({
                id: expert.id,
                surname: expert.surname,
                name: expert.name,
                patronymic: expert.patronymic,
                subject_area: expert.roles[index].subject_areas[0]
            })
        }
    });

    res.status(200).json(experts);
})

server.post('/api/project', (req, res) => {
    var user = { id: -1, surname: '', name: '', patronymic: ''};
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    let {
        name,
        description,
        subject_areas,
        project_type,
        goals,
        project_roles,
        start_date,
        finish_date,
        remuneration,
        selected_role_id
    } = req.body;

    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        // Get current projects data
        let data = JSON.parse(file_data.toString());

        let last_item_id = 0;

        if (data.projects.length !== 0) {
            // Get the id of last project
            last_item_id = data.projects[data.projects.length-1].id;
        }

        project_roles.forEach(function(part, index) {
            this[index].subscribes = [];
        }, project_roles);

        let team = [];
        if(user.roles.findIndex(role => role === 'student') !== -1) {
            let student_role = data.roles.find(role => role.id === selected_role_id)
            team.push({
                curator: null,
                students: [{
                    id: 0,
                    student: {
                        id: user.id,
                        surname: user.surname,
                        name: user.name,
                        patronymic: user.patronymic
                    },
                    role: {
                        id: student_role.id,
                        name: student_role.name,
                        subject_area: student_role.subject_area,
                    }
                }]
            })
        }
        if(user.roles.findIndex(role => role === 'curator') !== -1) {
            team.push({
                curator: {
                    id: user.id,
                    surname: user.surname,
                    name: user.name,
                    patronymic: user.patronymic
                },
                students: []
            })
        }

        const datetime = new Date();

        //Add new project
        data.projects.push(
            {
                id: last_item_id + 1,
                name: name,
                description: description,
                subject_areas: subject_areas,
                owner: {
                    id: user.id,
                    surname: user.surname,
                    name: user.name,
                    patronymic: user.patronymic
                },
                project_type: project_type,
                goals: goals,
                status: "Отправлена заявка",
                project_roles: project_roles,
                start_date: start_date,
                finish_date: finish_date,
                remuneration: remuneration,
                moderator: null,
                expertise: [],
                team: team,
                created_at: datetime.toLocaleDateString() + ' ' + datetime.toLocaleTimeString(),
                selected_role_id
            }); //add some data
        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'Created';
        res.status(201).json(message);
    });
})

server.post('/api/project/draft', (req, res) => {
    var user = { id: -1, surname: '', name: '', patronymic: ''};
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    let {
        name,
        description,
        subject_areas,
        project_type,
        goals,
        project_roles,
        start_date,
        finish_date,
        remuneration,
        selected_role_id
    } = req.body;

    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        // Get current projects data
        let data = JSON.parse(file_data.toString());

        let last_item_id = 0;

        if (data.projects.length !== 0) {
            // Get the id of last project
            last_item_id = data.projects[data.projects.length-1].id;
        }

        const datetime = new Date();

        project_roles.forEach(function(part, index) {
            this[index].subscribes = [];
        }, project_roles);

        let team = [];
        if(user.roles.findIndex(role => role === 'student') !== -1) {
            let student_role = data.roles.find(role => role.id === selected_role_id)
            team.push({
                curator: null,
                students: [{
                    id: 0,
                    student: {
                        id: user.id,
                        surname: user.surname,
                        name: user.name,
                        patronymic: user.patronymic
                    },
                    role: {
                        id: student_role.id,
                        name: student_role.name,
                        subject_area: student_role.subject_area,
                    }
                }]
            })
        }
        if(user.roles.findIndex(role => role === 'curator') !== -1) {
            team.push({
                curator: {
                    id: user.id,
                    surname: user.surname,
                    name: user.name,
                    patronymic: user.patronymic
                },
                students: []
            })
        }

            //Add new project
        data.projects.push(
            {
                id: last_item_id + 1,
                name: name,
                description: description,
                subject_areas: subject_areas,
                owner: {
                    id: user.id,
                    surname: user.surname,
                    name: user.name,
                    patronymic: user.patronymic
                },
                project_type: project_type,
                goals: goals,
                status: "Черновик",
                project_roles: project_roles,
                start_date: start_date,
                finish_date: finish_date,
                remuneration: remuneration,
                moderator: null,
                expertise: [],
                team: team,
                created_at: datetime.toLocaleDateString() + ' ' + datetime.toLocaleTimeString(),
                selected_role_id: selected_role_id
            }); //add some data
        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'Created';
        res.status(201).json(message);
    });
})

server.delete('/api/project/draft/:id', (req, res) => {
    var user = { id: -1, surname: '', name: '', patronymic: ''};
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }

    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        // Get current projects data
        let data = JSON.parse(file_data.toString());

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        if(user.id !== data.projects[id_project].owner.id) {
            const status = 401
            const message = 'Доступ запрещен'
            res.status(status).json({status, message})
            return
        }

        if(data.projects[id_project].status !== 'Черновик') {
            const status = 401
            const message = 'Проект нельзя удалить'
            res.status(status).json({status, message})
            return
        }

        data.projects.splice(id_project, 1);

        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'Deleted';
        res.status(204).json(message);
    });
})

server.post('/api/project/:id/edit', (req, res) => {
    var user = { id: -1, surname: '', name: '', patronymic: ''};
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }

    const {
        name,
        description,
        subject_areas,
        project_type,
        goals,
        project_roles,
        start_date,
        finish_date,
        remuneration,
        selected_role_id
    } = req.body;

    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 409
            const message = err
            res.status(status).json({status, message})
            return
        }

        // Get current projects data
        let data = JSON.parse(file_data.toString());

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);
        if(user.id !== data.projects[id_project].owner.id && user.id !== data.projects[id_project].moderator?.id) {
            const status = 403
            const message = 'Доступ запрещен'
            res.status(status).json({status, message})
            return
        }

        if(data.projects[id_project].status !== 'Черновик' && user.id !== data.projects[id_project].moderator?.id) {
            const status = 403
            const message = 'Проект нельзя редактировать'
            res.status(status).json({status, message})
            return
        }

        let team = [];
        if(user.roles.findIndex(role => role === 'student') > -1) {
            let student_role = data.roles.find(role => role.id === selected_role_id)
            team.push({
                curator: null,
                students: [{
                    id: 0,
                    student: {
                        id: user.id,
                        surname: user.surname,
                        name: user.name,
                        patronymic: user.patronymic
                    },
                    role: {
                        id: student_role.id,
                        name: student_role.name,
                        subject_area: student_role.subject_area,
                    }
                }]
            })
        }

        data.projects[id_project].name = name;
        data.projects[id_project].description = description;
        data.projects[id_project].subject_areas = subject_areas;
        data.projects[id_project].project_type = project_type;
        data.projects[id_project].goals = goals;
        data.projects[id_project].project_roles = project_roles;
        data.projects[id_project].start_date = start_date;
        data.projects[id_project].finish_date = finish_date;
        data.projects[id_project].remuneration = remuneration;
        data.projects[id_project].selected_role_id = selected_role_id;
        data.projects[id_project].team = team;

        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 409
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'Updated';
        res.status(204).json(message);
    });
})

server.post('/api/project/moderation/:id', (req, res) => {
    var user = { id: -1, surname: '', name: '', patronymic: ''};
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }

    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 409
            const message = err
            res.status(status).json({status, message})
            return
        }

        // Get current projects data
        let data = JSON.parse(file_data.toString());

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        data.projects[id_project].status = 'Отправлена заявка';

        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 409
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'Updated';
        res.status(204).json(message);
    });
})

server.post('/api/moderation/request/:id/accept', (req, res) => {
    let user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        let data = JSON.parse(file_data.toString());

        const moderator = {
            id: user.id,
            surname: user.surname,
            name: user.name,
            patronymic: user.patronymic
        };
        const status = "В обработке";

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        data.projects[id_project].moderator = moderator;
        data.projects[id_project].status = status;

        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'OK';
        res.status(200).json(message);
    });
})

server.post('/api/moderation/my-request/:id/reject', (req, res) => {
    let user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        let data = JSON.parse(file_data.toString());

        const status = 'Отклонён'

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        data.projects[id_project].status = status;

        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'OK';
        res.status(200).json(message);
    });
})

server.post('/api/moderation/my-request/:id/send-to-experts', (req, res) => {
    let user = null;
    let expert = null;
    const experts_id = req.body;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
        expert = userdb.users.find(user => experts_id.includes(user.id));
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        let data = JSON.parse(file_data.toString());

        const status = 'На экспертизе';

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        const sub_area_array = expert.roles.find(role => role.name === "expert").subject_areas;
        const sub_area = sub_area_array[0];

        data.projects[id_project].status = status;
        let expert_index = data.projects[id_project].expertise.findIndex(e => e.expert.id === expert.id);
        if(expert_index > -1) {
            data.projects[id_project].expertise[expert_index].comments.push({ grade: false, comment: null, datetime: null })
        } else {
            data.projects[id_project].expertise.push({
                expert: {
                    id: expert.id,
                    surname: expert.surname,
                    name: expert.name,
                    patronymic: expert.patronymic,
                    subject_area: {
                        id: sub_area.id,
                        name: sub_area.name
                    }
                },
                comments: [],
            });
        }

        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'OK';
        res.status(200).json(message);
    });
})

server.post('/api/expertise/request/:id/send-expertise', (req, res) => {
    let expert_id = null;
    const expertise = req.body;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        expert_id = verifyTokenResult.id;
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        let data = JSON.parse(file_data.toString());

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        let datetime = new Date();

        data.projects[id_project].expertise.find(expert => expert.expert.id === expert_id).comments.push({
            grade: expertise.grade,
            comment: expertise.comment,
            datetime: datetime.toLocaleDateString() + ' ' + datetime.toLocaleTimeString()
        })

        if(data.projects[id_project].expertise.findIndex(expert => expert.comments.length === 0) === -1) {
            data.projects[id_project].status = 'Оценен'
        }
        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'OK';
        res.status(200).json(message);
    });
})

server.post('/api/moderation/my-request/:id/send-to-curators', (req, res) => {
    let user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        let data = JSON.parse(file_data.toString());

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        if(data.projects[id_project].moderator?.id !== user.id) {
            const status = 403
            const message = 'Доступ запрещен'
            res.status(status).json({status, message})
            return
        }

        data.projects[id_project].status = 'Отправлен кураторам';

        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'Отправлен кураторам';
        res.status(200).json(message);
    });
})

server.post('/api/curation/project/:id/save-team-roles', (req, res) => {
    let user = null;
    const team = req.body;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        let data = JSON.parse(file_data.toString());

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        let team_id = data.projects[id_project].team.findIndex(t => t.curator?.id === user.id);

        let number_seats = 0;
        data.projects[id_project].project_roles.forEach(role => number_seats += role.number_seats)

        let count = 0;
        data.projects[id_project].project_roles.forEach( role => {
            data.projects[id_project].team.forEach(team => {
                team.students?.forEach(student_role => {
                    if(student_role.role?.id === role.id) {
                        count++;
                    }
                })
            })
        })

        if (count === number_seats) {
            data.projects[id_project].status = 'Кураторы определены';
            var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
                if (err) {
                    const status = 401
                    const message = err
                    res.status(status).json({status, message})
                    return
                }
            });
            const status = 409
            const message = 'Все роли разобраны'
            res.status(status).json({status, message})
            return
        } else {
            if(team_id > -1) {
                data.projects[id_project].team[team_id].students = team;
            } else {
                data.projects[id_project].team.push({
                    curator: {
                        id: user.id,
                        surname: user.surname,
                        name: user.name,
                        patronymic: user.patronymic
                    },
                    students: team
                });
            }

            number_seats = 0;
            data.projects[id_project].project_roles.forEach(role => number_seats += role.number_seats)

            count = 0;
            data.projects[id_project].project_roles.forEach( role => {
                data.projects[id_project].team.forEach(team => {
                    team.students?.forEach(student_role => {
                        if(student_role.role?.id === role.id) {
                            count++;
                        }
                    })
                })
            })

            if (count === number_seats) {
                data.projects[id_project].status = 'Кураторы определены';
            }

            var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
                if (err) {
                    const status = 401
                    const message = err
                    res.status(status).json({status, message})
                    return
                }
            });
            const message = 'OK';
            res.status(200).json(message);
        }
    });
})

server.post('/api/moderation/my-request/:id/start-project-recruitment', (req, res) => {
    let user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        let data = JSON.parse(file_data.toString());

        const status = 'Набор участников';

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        if(user.id !== data.projects[id_project].moderator?.id) {
            const status = 403
            const message = 'Доступ запрещен'
            res.status(status).json({status, message})
            return
        }

        data.projects[id_project].status = status;

        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'OK';
        res.status(200).json(message);
    });
})

server.post('/api/curation/project/:id/subscribe', (req, res) => {
    let user = null;
    const { role_id } = req.body;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        let data = JSON.parse(file_data.toString());

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        if(data.projects[id_project].project_roles.findIndex(role => role.subscribes.find(subscribe => subscribe.id === user.id)) !== -1) {
            const status = 403
            const message = "Вы уже подписались на роль в проекте"
            res.status(status).json({status, message})
            return
        }

        const id_role = data.projects[id_project].project_roles.findIndex(role => role.id === role_id)

        data.projects[id_project].project_roles[id_role].subscribes.push({
            id: user.id,
            surname: user.surname,
            name: user.name,
            patronymic: user.patronymic,
            status_subscribe: false
        })

        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'OK';
        res.status(200).json(message);
    });
})

server.post('/api/curation/project/:id/save-team-members', (req, res) => {
    let user = null;
    const selected_students = req.body;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        let data = JSON.parse(file_data.toString());

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        let team_index = data.projects[id_project].team.findIndex(t => t.curator?.id === user.id);

        let students = data.projects[id_project].team[team_index].students;
        let roles = data.projects[id_project].project_roles

        students.forEach((student, index, students) => selected_students.find(selected_student => {
            if(student.id === selected_student.id) {
                students[index] = selected_student;
            }
        }));

        roles.forEach((role, index, roles) => selected_students.find(selected_student => role.subscribes.find((subscribe, i) => {
            if(subscribe.id === selected_student.id) {
                roles[index].subscribes[i].status_subscribe = true;
            }
        })));

        let teams = data.projects[id_project].team;

        let check = true;
        teams.forEach( team => team.students.forEach(student =>  {
            if (student.student === null) {
                check = false
            }
        }))
        if(check) {
            data.projects[id_project].status = 'Команда собрана'
        }
        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });

        const message = 'OK';
        res.status(200).json(message);
    });
})

server.post('/api/moderation/my-request/:id/start-project', (req, res) => {
    let user = null;
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({status, message});
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401
            const message = 'Access token not provided'
            res.status(status).json({status, message})
            return
        }
        const userdb = JSON.parse(fs.readFileSync('./json-server/db-users.json', 'UTF-8'));
        user = userdb.users.find(user => user.id === verifyTokenResult.id);
    } catch (err) {
        const status = 401
        const message = 'Error accessToken is revoked'
        res.status(status).json({status, message})
    }
    fs.readFile('./json-server/db.json', 'UTF-8',(err, file_data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({status, message})
            return
        }

        let data = JSON.parse(file_data.toString());

        const status = 'В процессе';

        const id = parseInt(req.params.id);
        const id_project = data.projects.findIndex(project => project.id === id);

        if(user.id !== data.projects[id_project].moderator?.id) {
            const status = 403
            const message = 'Доступ запрещен'
            res.status(status).json({status, message})
            return
        }

        data.projects[id_project].status = status;

        var writeData = fs.writeFile('./json-server/db.json', JSON.stringify(data), 'UTF-8',(err, result) => {  // WRITE
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({status, message})
                return
            }
        });
        const message = 'OK';
        res.status(200).json(message);
    });
})


// server.use(/^(?!\/auth).*$/,  (req, res, next) => {
//     if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
//         const status = 401
//         const message = 'Error in authorization format'
//         res.status(status).json({status, message})
//         return
//     }
//     try {
//         let verifyTokenResult;
//         verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);
//
//         if (verifyTokenResult instanceof Error) {
//             const status = 401
//             const message = 'Access token not provided'
//             res.status(status).json({status, message})
//             return
//         }
//         next()
//     } catch (err) {
//         const status = 401
//         const message = 'Error accessToken is revoked'
//         res.status(status).json({status, message})
//     }
// })

server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/projects/:id': '/projects/:id',
}))

server.use(router)

server.listen(8000, () => {
    console.log('Run Auth API Server')
})