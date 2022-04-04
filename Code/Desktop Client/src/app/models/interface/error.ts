export type CredentialError = {
    ID: CredentialErrorType
};

export enum CredentialErrorType {
    usernameExists = 'USERNAME_EXISTS',
    emailExists = 'EMAIL_EXISTS',
    alreadySignedIn = 'ALREADY_SIGNED_IN',
    wrongCredentials = 'WRONG_CREDENTIALS',
}
