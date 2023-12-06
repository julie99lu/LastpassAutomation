// import common functions and common objects
const { test, expect } = require('@playwright/test');
const common = require('./common/functions.js');
const items = require('./common/items.js');

//test.use({ locale: 'en-US' });

const username = items.LOGIN.USER_NAME;
const password = items.LOGIN.PASSWORD; 

test.describe('Login Successfully', () => {
    test('Should allow me to Login with registered username and password and Log out successfully', async ({ page }) => {
        await common.login(page, expect, username, password);
        await common.logout(page, expect);
    });
    
    test('Should allow me to Login with all lowercase of userName and Log out successfully', async ({ page }) => {
        const username_lowercase = 'mitacs.test@gmail.com'; 
        await common.login(page, expect, username_lowercase, password);
        await common.logout(page, expect);
    });

    test('Should allow me to Login with all uppercase of userName and Log out successfully', async ({ page }) => {
        const username_uppercase = 'MITACS.TEST@gmail.com';
        await common.login(page, expect, username_uppercase, password);
        await common.logout(page, expect);
    });
})

test.describe('Login Not Allowed', () => {
    
    const username_wrong = 'Mitacs.Test.bad@gmail.com';    
    test('Should not allow me to Login with a non existing username.', async ({ page }) => {
        await common.loginNotAllowed(page, expect, username_wrong, password_lowercase, items.ERRORMSG.LOGIN_ERROR_FOR_INVALID_USER);
    });
    
    
    const password_wrong = 'Mitacs.Test1@123';    
    test('Should not allow me to Login with a wrong password.', async ({ page }) => {
        await common.loginNotAllowed(page, expect, username, password_wrong, items.ERRORMSG.LOGIN_ERROR_FOR_INVALID_PWD);
    });
    
    const password_lowercase = 'mitacs.test@123';    
    test('Should not allow me to Login with a password for wrong case format.', async ({ page }) => {
        await common.loginNotAllowed(page, expect, username, password_lowercase, items.ERRORMSG.LOGIN_ERROR_FOR_INVALID_PWD);
    });
    
})

