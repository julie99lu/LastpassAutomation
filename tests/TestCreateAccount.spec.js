// import common functions and common items
const { test, expect } = require('@playwright/test');
const common = require('./common/functions.js');
const items = require('./common/items.js');


test.describe('Create Account Successfully', () => {
    test('Should allow me create a new account with valid email and password', async ({ page}) => {
        const email = 'Peter123.liu@gmail.com';
        const password = 'Howareyou@today01';
        await common.createAccount(page, expect, email, password, null);
    
        // Cannot create a new account by automation. got error like 'Something doesn't look right....'
        await expect(page.locator("//div[@class='lp-alert__desc']/p")).toContainText('Your account has been successfully created!');      
        //await expect(page.locator("//div[@class='ca-general-error']/div")).toContainText(items.ERRORMSG.CREATE_ACCOUNT_ERROR_FOR_GENERAL);
    });

    test('Should allow me create a new account with valid email and password and Reminder', async ({ page}) => {
        const email = 'Jason123.Ho@gmail.com';
        const password = 'HappChristmas@today01';
        const reminder = 'Holiday';
        await common.createAccount(page, expect, email, password, reminder);
    
        // Cannot create a new account by automation. got error like 'Something doesn't look right....'
        await expect(page.locator("//div[@class='lp-alert__desc']/p")).toContainText('Your account has been successfully created!');      
        await expect(page.locator("//div[@class='ca-general-error']/div")).toContainText(items.ERRORMSG.CREATE_ACCOUNT_ERROR_FOR_GENERAL);
    });
})


test.describe('Create Account not allowed', () => {   
    test('Should not allow me create a new account with existing email', async ({ page}) => {
        // Define variable
        const email = 'Mitacs.Test@gmail.com';

        // Got to Create Account page
        common.gotToCreateAccountPage(page, expect);

        // Fill email 
        await page.locator('#email').fill(email);
        // Have to pause for a short while to make filling is done, or else after Tab out, it will gain focus agian.
        await page.waitForTimeout(1000);
        await page.locator('#email').press('Tab');


        // Verify message prompt as expected
        await expect(page.locator("//div[@class='email-error']/p")).toContainText(items.ERRORMSG.CREATE_ACCOUNT_ERROR_FOR_EMAIL_IN_USE);
    });

    test('Should not allow me create a new account with invalid email', async ({ page}) => {
        // Define variable
        const email = 'Jason123.Hogmail.com';

        // Got to Create Account page
        common.gotToCreateAccountPage(page, expect);

        // Fill email 
        await page.locator('#email').fill(email);
        // Have to pause for a short while to make email filling is done, or else after Tab out, it will gain focus agian.
        await page.waitForTimeout(1000);
        await page.locator('#email').press('Tab');

        // Verify error message is as expected.
        await expect(page.locator("//div[@class='email-error']/p")).toContainText(items.ERRORMSG.CREATE_ACCOUNT_ERROR_FOR_EMAIL_INVALID);
    });

    
    test('Should not allow me create a new account with mismatch password', async ({ page}) => {
        // Define variable
        const email = 'Peter123.liu.valid@gmail.com';
        const password1 = 'Howareyou@today01';
        const password2 = 'Howareyou@today02';

        // Got to Create Account page
        common.gotToCreateAccountPage(page, expect);

        // Fill email 
        await page.locator('#email').fill(email);
        await page.locator('#email').press('Tab');
        await page.waitForTimeout(500);

        // Fill password
        await page.locator('#masterpassword').fill(password1);
        await page.locator('#masterpassword').press('Tab');
        await page.waitForTimeout(500);

        // Fill confirmation password
        await page.locator('#confirmmpw').fill(password2);
        await page.locator('#confirmmpw').press('Tab');
        await page.waitForTimeout(500);

        // Verify error message is as expected.
        await expect(page.locator("//div[@class='confirmpw-error']/p")).toContainText(items.ERRORMSG.CREATE_ACCOUNT_ERROR_FOR_PWD_MISMATCH);
    });
})

