import { SERVER_LINK } from 'src/app/models/constant/drawing/constant';
import { Salt } from 'src/app/models/interface/salt';

export const AUTHENTICATION_HTTP = SERVER_LINK + '/auth/salt/?user=';
export const WRONG_CREDENTIAL = 'WRONG_CREDENTIALS';

export const MOCK_SALT: Salt = {
    tempSalt: '0',
    permSalt: '1',
};
