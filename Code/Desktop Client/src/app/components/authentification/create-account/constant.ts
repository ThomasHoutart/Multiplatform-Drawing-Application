import { SERVER_LINK } from 'src/app/models/constant/drawing/constant';
import { CredentialCreation } from 'src/app/models/interface/user';

export const MIN_CHARACTERS = 2;
export const MAX_CHARACTERS = 20;
export const MIN_CHARACTERS_USER = 4;
export const MAX_CHARACTERS_USER = 20;
export const MAX_CHARACTERS_EMAIL = 40;


// found on https://stackoverflow.com/questions/53611097/angular-6-email-regex
export const EMAIL_REGEX = '[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}';
// found on https://www.regexpal.com/93648
export const NAME_REGEX = '^[a-zA-Z]+(([\',. -][a-zA-Z ])?[a-zA-Z]*)*$';
// found on
export const USERNAME_REGEX = '^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$';

export const REGISTER_HTTP = SERVER_LINK + '/auth/register/';

export const TEST_CREDENTIAL: CredentialCreation = {
    firstName: 'Thomas',
    lastName: 'Houtart',
    username: 'Tom2',
    email: 'boiii@houlu.cc',
    hash: ''
};
