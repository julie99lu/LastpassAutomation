// import common functions and common items
const { test, expect } = require('@playwright/test');
const common = require('./common/functions.js');
const items = require('./common/items.js');

test.describe('Test Add function', () => {
    test('Should allow me add a pasword item with URL, Name, Folder, Usernam ,Site Password and Notes. Delete the added item for next run.', async ({ page}) => {
        // Preapate data
        const passwordObj = new items.PasswordItem({
            URL: 'lastpass.com',
            Name: 'Lastpass',
            Group: 'WebsiteAccount',
            Username: items.LOGIN.USER_NAME,
            Password: items.LOGIN.PASSWORD,
            Notes: 'Lastpass password',
        });
        // Login first
        await common.login(page, expect, items.LOGIN.USER_NAME, items.LOGIN.PASSWORD);
        // Add password
        await common.addPassword(page, expect, passwordObj);
        // Delete it
        await common.deletePassword(page, expect, passwordObj);
    });
    test('Should allow me add a pasword item with parital information like URL, Name, Folder. Delete the added item for next run after done Add testing.', async ({ page}) => {
        // Preapate data
        const passwordObj = new items.PasswordItem({
            URL: 'lastpass.com',
            Name: 'Lastpass',
            Group: 'WebsiteAccount',
        });
        // Login first
        await common.login(page, expect, items.LOGIN.USER_NAME, items.LOGIN.PASSWORD);
        // Add password
        await common.addPassword(page, expect, passwordObj);
        // Delete it
        await common.deletePassword(page, expect, passwordObj);
    });

    test('Should allow me add a pasword item with only Name and Folder, leave othe empty.  Delete the added item for next run after done Add testing.', async ({ page}) => {
        // Preapate data
        const passwordObj = new items.PasswordItem({
            Name: 'Lastpass',
            Group: 'WebsiteAccount',
        });
        // Login first
        await common.login(page, expect, items.LOGIN.USER_NAME, items.LOGIN.PASSWORD);
        // Add password
        await common.addPassword(page, expect, passwordObj);
        // Delete it
        await common.deletePassword(page, expect, passwordObj);
    });
    test('Should allow me add a pasword item with Advanced Settings like AutoLogin checked. Delete the added item for next run after done Add testing.', async ({ page}) => {
        // Preapate data
        const passwordObj = new items.PasswordItem({
            URL: 'lastpass.com',
            Name: 'Lastpass',
            Group: 'WebsiteAccount',
            Username: items.LOGIN.USER_NAME,
            Password: items.LOGIN.PASSWORD,
            Notes: 'Lastpass password',
            Autologin: true,
            DisableAutofill: true
        });
        // Login first
        await common.login(page, expect, items.LOGIN.USER_NAME, items.LOGIN.PASSWORD);
        // Add password
        await common.addPassword(page, expect, passwordObj);
        // Delete it
        await common.deletePassword(page, expect, passwordObj);
    });
})


test.describe('Test Edit function', () => {
    test('Creat a Password Item for later editing', async ({ page}) => {
        // Preapate data for add
        const passwordObj = new items.PasswordItem({
            URL: 'lastpass.com',
            Name: 'Lastpass',
            Group: 'WebsiteAccount',
            Username: items.LOGIN.USER_NAME,
            Password: items.LOGIN.PASSWORD,
            Notes: 'Lastpass password',
        });
        // Login first
        await common.login(page, expect, items.LOGIN.USER_NAME, items.LOGIN.PASSWORD);

        // Add password
        await common.addPassword(page, expect, passwordObj);

    });
    test('Should allow me edit the password item with updated URL, UserName, Password, Notes', async ({ page}) => {
        // Login first
        await common.login(page, expect, items.LOGIN.USER_NAME, items.LOGIN.PASSWORD);

        // the original folder and name
        const folder = 'WebsiteAccount';
        const name ='Lastpass';

        // Information is going to be udptaed
        const passwordObj_update = new items.PasswordItem({
            URL: 'lastpass.com.updated',
            Username: items.LOGIN.USER_NAME + '_updated',
            Password: "PasswordUpdated",
            Notes: 'Lastpass password updated',
        });

        await common.editPassword(page, expect, folder, name, passwordObj_update);
    });

    test('Should allow me edit the password item with advanced settings like autoLogin and DisableAutofill checked.', async ({ page}) => {
        // Login first
        await common.login(page, expect, items.LOGIN.USER_NAME, items.LOGIN.PASSWORD);

        // the original folder and name
        const folder = 'WebsiteAccount';
        const name ='Lastpass';

        // Information is going to be udptaed
        const passwordObj_update = new items.PasswordItem({
            Autologin: true,
            DisableAutofill: true
        });

        await common.editPassword(page, expect, folder, name, passwordObj_update);
    });

    test('Should allow me edit the password item with advanced settings like autoLogin and DisableAutofill unchecked.', async ({ page}) => {
        // Login first
        await common.login(page, expect, items.LOGIN.USER_NAME, items.LOGIN.PASSWORD);

        // the original folder and name
        const folder = 'WebsiteAccount';
        const name ='Lastpass';

        // Information is going to be udptaed
        const passwordObj_update = new items.PasswordItem({
            Autologin: false,
            DisableAutofill: false
        });

        await common.editPassword(page, expect, folder, name, passwordObj_update);
    });

    test('Should allow me edit change the Folder and Name.', async ({ page}) => {
        // Login first
        await common.login(page, expect, items.LOGIN.USER_NAME, items.LOGIN.PASSWORD);

        // the original folder and name
        const folder = 'WebsiteAccount';
        const name ='Lastpass';

        // Information is going to be udptaed
        const passwordObj_update = new items.PasswordItem({
            Name: 'Lastpass_Updated',
            Group: 'WebsiteAccount_Updated',
        })

        await common.editPassword(page, expect, folder, name, passwordObj_update);
    });

    test('Delete the Item for next run', async ({ page}) => {
        // Login first
        await common.login(page, expect, items.LOGIN.USER_NAME, items.LOGIN.PASSWORD);


        // Use the lastest Name and Group after done the editing
        const passwordObj = new items.PasswordItem({
            Name: 'Lastpass_Updated',
            Group: 'WebsiteAccount_Updated',
        })

        await common.deletePassword(page, expect, passwordObj);
    });
});
