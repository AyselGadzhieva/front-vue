import api from './api';
import TokenService from "./token.service";
class AuthService {
    login(user) {
        return api
            .post('login',{
                email: user.email,
                password: user.password
            })
            .then(response => {
                if (response.data.authorization.token) {
                    TokenService.setUser(response.data.authorization);
                    return response.data.authorization;
                } else return response.data;
            });
    }
    logout() {
        TokenService.removeUser('user');
    }
    register(user) {
        return api.post('register', {
            email: user.email,
            password: user.password,
            surname: user.surname,
            name: user.name,
            patronymic: user.patronymic,
            organization: user.organization,
            phone: user.phone
        })
        .then(response => {
            if (response.data.authorization.token) {
                TokenService.setUser(response.data.authorization);
                return response.data.authorization;
            } else return response.data;
        });
    }
}
export default new AuthService();