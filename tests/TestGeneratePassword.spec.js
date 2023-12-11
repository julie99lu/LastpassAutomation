const { test, expect } = require('@playwright/test');

///////////////////////////////////////
// Define elements' locator and constants needed for the feature
///////////////////////////////////////

// Define elements with their locator
const GEN_PWD_LOCTORS = {
    PASSWORD_INPUT: '#GENERATED-PASSWORD',
    PWD_LEN_INPUT: '#lp-pg-password-length',
    EASY_TO_SAY_LABEL: "//label[@for='lp-pg-easy-to-say']",
    EASY_TO_READ_LABEL: "//label[@for='lp-pg-easy-to-read']",
    ALL_CHARACTERS_LABEL: "//label[@for='lp-pg-all-characters']",
    UPPERCASE_LABLE: "//label[@for='lp-pg-uppercase']",
    LOWERCASE_LABLE: "//label[@for='lp-pg-lowercase']",
    NUMBERS_LABLE: "//label[@for='lp-pg-numbers']",
    SYMBOLS_LABLE: "//label[@for='lp-pg-symbols']",
    COPY_ICON_BUTTON: "//form[@id='GENERATED-PASSWORD-FORM']/following-sibling:: div[1]/button[1]",
    RERESH_ICON_BUTTON: "//form[@id='GENERATED-PASSWORD-FORM']/following-sibling:: div[1]/button[2]",
    COPY_PASSWORD_BUTTON: "//form[@id='PG-FORM']/following-sibling:: div[1]/button[1]",
    COPIED_POPUP_CLOSE_X_BUTTON: "//button[@class='lp-popup__top-close']",
    RANGE_SLIDER_BUTTON: "//button[@class='lp-custom-range__slider']"
};
// Define reges for password rules
const PWD_RULE_REGEX = new Map([
    ['UPPERCASE', /^(?=.*[A-Z]).+$/],
    ['LOWERCASE', /^(?=.*[a-z]).+$/],
    ['NUMBERS', /^(?=.*\d).+$/],
    ['SYMBOLS', /^(?=.*[\W_]).+$/],
    ['AMBIGUOUS_I_1_O_0', /[l1O0]+/],
]);

// Define timer and frequence used to wait for password being generated
// Noticed sometimes the website has hiccup, need long time to generate a password
const TIMER = {
    GEN_PWD_MILISEC: 60000,
    GEN_PWD_CHECK_INTERVAL_MILISEC: 500
};

const DEFAULT_PWD_LENGTH = 12;

///////////////////////////////////////
// Define common functions needed for the feature
///////////////////////////////////////

class TestFunctions {

    // Constructor for the TestFunctions class
    async TestFunctions() {
    }

    /**
     * Navigates to the password generator page and verifies the visibility of the 'Copy Password' button.
     * Scrolls to the password input and waits for a password to be generated.
     * 
     * @param {import('@playwright/test').Page} page
     * @param {import('@playwright/test').Expect} expect
     */
    async goToGeneratePasswordPage(page, expect) {
        // Go to base URL
        const baseURL = 'https://www.lastpass.com/features/password-generator';
        await page.goto(baseURL);

        // wait for 'Copy Password' button show up
        await expect(page.getByRole('button', { name: 'Copy Password' })).toBeVisible({ timeout: 15000 });

        // Scroll to Password input element
        await page.locator(GEN_PWD_LOCTORS.PASSWORD_INPUT).scrollIntoViewIfNeeded();

        // Needs to wait for password was generated before any other actions
        var result = await this.waitForPasswordGenerated(page, DEFAULT_PWD_LENGTH);
        expect(result).toBe(true);
    }

    /**
     *  Fills the password length input then tab out.
     *  Waits for the new password to be generated.
     *
     * @param {import('@playwright/test').Page} page
     * @param {import('@playwright/test').Expect} expect
     * @param {string} length
     */
    async fillPasswordLength(page, expect, length) {
        // Fill password length input  
        await page.locator(GEN_PWD_LOCTORS.PWD_LEN_INPUT).fill(length);
        await page.locator(GEN_PWD_LOCTORS.PWD_LEN_INPUT).press('Tab');

        // Wait and verify new password was generated with the expected length
        expect(await this.waitForPasswordGenerated(page, length)).toBe(true);
    }

    /**
     * Waits for a password to be generated within a specified length of time.
     * Monitors the password input field continuously until a password of the desired length is generated or a timeout occurs.
     *
     * @param {import('@playwright/test').Page} page
     * @param {import('@playwright/test').Expect} expect
     * @returns {Promise<boolean>} - A Promise indicating if the password was generated within the specified length
     */
    async waitForPasswordGenerated(page, length) {
        try {
            const startTime = Date.now();

            // Wait for the password input field to appear
            await page.waitForSelector(GEN_PWD_LOCTORS.PASSWORD_INPUT);

            // Continuously check the input field value in a loop
            while (true) {
                const currentTime = Date.now();

                const input = await page.locator(GEN_PWD_LOCTORS.PASSWORD_INPUT);
                const value = await input.evaluate((el) => el.value);

                // If password length equals to the expected length, means password was sucessfully generated
                if (value.length == length) {
                    console.log("password length: " + value.length);
                    console.log('password: ' + value);
                    return true;
                }

                // Check if the timeout duration has been reached
                if (currentTime - startTime > TIMER.GEN_PWD_MILISEC) {
                    console.log('Timeout reached. Password not generated.');
                    return false;
                }

                // Wait for a short period before checking again
                await page.waitForTimeout(TIMER.GEN_PWD_CHECK_INTERVAL_MILISEC);
            }
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }

     /**
     * Verify negerated password match the rules
     *
     * @param {import('@playwright/test').Page} page
     * @param {import('@playwright/test').Expect} expect
     * @returns {Promise<boolean>} - A Promise indicating if the password was generated within the specified length
     */   

    async verifyPasswordMmatchRules(expect, password, rules) {
        for (const [key, value] of rules) {
            const rule = PWD_RULE_REGEX.get(key);
            console.log("PWD_RULE_REGEX[" + key + "] = " + rule);
            if (value) {        
                await expect(password).toEqual(expect.stringMatching(rule));
            } else {
                await expect(password).not.toEqual(expect.stringMatching(rule));
            }
        }
    }
}

// Instantiating an object of the TestFunctions class to use its test functions in beow tests
const testFunctions = new TestFunctions();

///////////////////////////////////////
// Define tests for feature tenerating password
///////////////////////////////////////

/**
 * Function 1 - Create a password easy to say
 * This suite contains tests that allow creating an 'Easy to say' password with different lengths and rule configurations.
 */
test.describe("[Function 1: Create a password easy to say] @function1", () => {
    test("Allows creating an 'Easy to say' password with 'length = 10' and default rule set to 'Uppercase and Lowercase only' ", async ({ page }) => {
        // Prepare data
        const len = '10';
        let PWD_RULE = new Map([
            ['UPPERCASE', true],
            ['LOWERCASE', true],
            ['NUMBERS', false],
            ['SYMBOLS', false]
        ]);

        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Click 'Easy to say' radio button
        await page.locator(GEN_PWD_LOCTORS.EASY_TO_SAY_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Verify the default status of checkbox when 'Easy to say' is selected 
        expect(await page.isChecked(GEN_PWD_LOCTORS.UPPERCASE_LABLE)).toBeTruthy()
        expect(await page.isChecked(GEN_PWD_LOCTORS.LOWERCASE_LABLE)).toBeTruthy()
        expect(await page.isEnabled(GEN_PWD_LOCTORS.NUMBERS_LABLE)).toBeFalsy()
        expect(await page.isEnabled(GEN_PWD_LOCTORS.SYMBOLS_LABLE)).toBeFalsy()

        // Get generated password 
        const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);

        // Verify the Password match the rule 
        await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)

    });

    test("Allows creating an 'Easy to say' password with 'length = 50' and rule set to 'Uppercase only' ", async ({ page }) => {
        // Prepare data
        const len = '50';
        let PWD_RULE = new Map([
            ['UPPERCASE', true],
            ['LOWERCASE', false],
            ['NUMBERS', false],
            ['SYMBOLS', false]
        ]);

        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)
        //await page.pause();

        // Click 'Easy to say' radio button
        await page.locator(GEN_PWD_LOCTORS.EASY_TO_SAY_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Uncheck Lowercase
        await page.locator(GEN_PWD_LOCTORS.LOWERCASE_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.LOWERCASE_LABLE)).toBeFalsy();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Get generated password 
        const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);

        // Verify the Password match the rule 
        await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)

    });

    test("Allows creating an 'Easy to say' password with 'length = 4' and rule set to 'Lowercase only' ", async ({ page }) => {
        // Prepare data: 
        const len = '4';
        let PWD_RULE = new Map([
            ['UPPERCASE', false],
            ['LOWERCASE', true],
            ['NUMBERS', false],
            ['SYMBOLS', false]
        ]);
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Click 'Easy to say' radio button
        await page.locator(GEN_PWD_LOCTORS.EASY_TO_SAY_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Uncheck Uppercase rule
        await page.locator(GEN_PWD_LOCTORS.UPPERCASE_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.UPPERCASE_LABLE)).toBeFalsy();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Get generated password 
        const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);

        // Verify the Password match the rule 
        await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)

    });
})

/**
 * Function 2 - Create a password easy to read
 * This suite contains tests that allow creating an 'Easy to say' password with different lengths and rule configurations.
 */
test.describe("[Function 2: Create a password easy to read] @function2", () => {
    // Make sure no ambiguous characters like l, 1, O, and 0
    test("Allows creating an 'Easy to read' password with 'length = 8' and default rule with Uppercase + Lowercase + Numbers + Symbols.", async ({ page }) => {
        // Prepare data: 
        const len = '8';
        let PWD_RULE = new Map([
            ['UPPERCASE', true],
            ['LOWERCASE', true],
            ['NUMBERS', true],
            ['SYMBOLS', true],
            ['AMBIGUOUS_I_1_O_0', false]
        ]);

        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Click 'Easy to read' radio button
        await page.locator(GEN_PWD_LOCTORS.EASY_TO_READ_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Verify the default status of checkbox when 'Easy to say' is selected 
        expect(await page.isChecked(GEN_PWD_LOCTORS.UPPERCASE_LABLE)).toBeTruthy()
        expect(await page.isChecked(GEN_PWD_LOCTORS.LOWERCASE_LABLE)).toBeTruthy()
        expect(await page.isChecked(GEN_PWD_LOCTORS.NUMBERS_LABLE)).toBeTruthy()
        expect(await page.isChecked(GEN_PWD_LOCTORS.SYMBOLS_LABLE)).toBeTruthy()
        expect(await page.isEnabled(GEN_PWD_LOCTORS.NUMBERS_LABLE)).toBeTruthy()
        expect(await page.isEnabled(GEN_PWD_LOCTORS.SYMBOLS_LABLE)).toBeTruthy()

        // Get generated password 
        const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
  
        // Verify the Password match the rule 
        await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)

    });

    test("Allows creating an 'Easy to read' password with 'length = 20' and rule set to 'Uppercase only' ", async ({ page }) => {
        // Prepare data: 
        const len = '20';
        let PWD_RULE = new Map([
            ['UPPERCASE', true],
            ['LOWERCASE', false],
            ['NUMBERS', false],
            ['SYMBOLS', false],
            ['AMBIGUOUS_I_1_O_0', false]
        ]);

        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        //await page.pause();

        // Click 'Easy to read' radio button
        await page.locator(GEN_PWD_LOCTORS.EASY_TO_READ_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Uncheck Lowercase, Numbers, Symbols
        await page.locator(GEN_PWD_LOCTORS.LOWERCASE_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.LOWERCASE_LABLE)).toBeFalsy();
        await page.locator(GEN_PWD_LOCTORS.NUMBERS_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.NUMBERS_LABLE)).toBeFalsy();
        await page.locator(GEN_PWD_LOCTORS.SYMBOLS_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.SYMBOLS_LABLE)).toBeFalsy();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Get generated password 
        const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
  
        // Verify the Password match the rule 
        await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)

    });

    test("Allows creating an 'Easy to read' password with 'length = 1' and rule set to 'Lowercase only' ", async ({ page }) => {
        // Prepare data: 
        const len = '1';
        let PWD_RULE = new Map([
            ['UPPERCASE', false],
            ['LOWERCASE', true],
            ['NUMBERS', false],
            ['SYMBOLS', false],
            ['AMBIGUOUS_I_1_O_0', false]
        ]);
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Click 'Easy to read' radio button
        await page.locator(GEN_PWD_LOCTORS.EASY_TO_READ_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Uncheck Uppercase, Numbers, Symbols
        await page.locator(GEN_PWD_LOCTORS.UPPERCASE_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.UPPERCASE_LABLE)).toBeFalsy();
        await page.locator(GEN_PWD_LOCTORS.NUMBERS_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.NUMBERS_LABLE)).toBeFalsy();
        await page.locator(GEN_PWD_LOCTORS.SYMBOLS_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.SYMBOLS_LABLE)).toBeFalsy();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

       // Get generated password 
       const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
  
       // Verify the Password match the rule 
       await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)
    });

    test("Allows creating an 'Easy to read' password with 'length = 15' and rule set to 'Uppercase + Lowercase + Numbers' ", async ({ page }) => {
        // Prepare data: 
        const len = '15';
        let PWD_RULE = new Map([
            ['UPPERCASE', true],
            ['LOWERCASE', true],
            ['NUMBERS', true],
            ['SYMBOLS', false],
            ['AMBIGUOUS_I_1_O_0', false]
        ]);
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Click 'Easy to read' radio button
        await page.locator(GEN_PWD_LOCTORS.EASY_TO_READ_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Uncheck Symbols
        await page.locator(GEN_PWD_LOCTORS.SYMBOLS_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.SYMBOLS_LABLE)).toBeFalsy();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

       // Get generated password 
       const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
  
       // Verify the Password match the rule 
       await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)
    });

    test("Allows creating an 'Easy to read' password with 'length = 27' and rule set to 'Uppercase + Lowercase + Symbols' ", async ({ page }) => {
        // Prepare data: 
        const len = '27';
        let PWD_RULE = new Map([
            ['UPPERCASE', true],
            ['LOWERCASE', true],
            ['NUMBERS', false],
            ['SYMBOLS', true],
            ['AMBIGUOUS_I_1_O_0', false]
        ]);
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Click 'Easy to read' radio button
        await page.locator(GEN_PWD_LOCTORS.EASY_TO_READ_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Uncheck Numbers
        await page.locator(GEN_PWD_LOCTORS.NUMBERS_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.NUMBERS_LABLE)).toBeFalsy();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

       // Get generated password 
       const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
  
       // Verify the Password match the rule 
       await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)
    });

    test("Allows creating an 'Easy to read' password with 'length = 23' and rule set to 'Numbers + Symbols' ", async ({ page }) => {
        // Prepare data: 
        const len = '23';
        let PWD_RULE = new Map([
            ['UPPERCASE', false],
            ['LOWERCASE', false],
            ['NUMBERS', true],
            ['SYMBOLS', true],
            ['AMBIGUOUS_I_1_O_0', false]
        ]);
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Click 'Easy to read' radio button
        await page.locator(GEN_PWD_LOCTORS.EASY_TO_READ_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Uncheck Uppercase and Lowercase
        await page.locator(GEN_PWD_LOCTORS.UPPERCASE_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.UPPERCASE_LABLE)).toBeFalsy();
        await page.locator(GEN_PWD_LOCTORS.LOWERCASE_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.LOWERCASE_LABLE)).toBeFalsy();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

       // Get generated password 
       const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
  
       // Verify the Password match the rule 
       await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)

    });
})

/**
 * Function 3 - Create a password allowing all characters
 * This suite contains tests that allow creating a password allowing all characters with different lengths and rule configurations.
 */
test.describe("[Function 3: Create a password allowing all characters]  @function3", () => {
    test("All me create a password with 'length = 10' and default rule with all charaters including Uppercase + Lowercase + Numbers + Symbols.", async ({ page }) => {
        // Prepare data: 
        const len = '10';
        let PWD_RULE = new Map([
            ['UPPERCASE', true],
            ['LOWERCASE', true],
            ['NUMBERS', true],
            ['SYMBOLS', true]
        ]);
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Click 'Easy to read' radio button
        await page.locator(GEN_PWD_LOCTORS.ALL_CHARACTERS_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Verify the default status of checkbox when 'Easy to say' is selected 
        expect(await page.isChecked(GEN_PWD_LOCTORS.UPPERCASE_LABLE)).toBeTruthy()
        expect(await page.isChecked(GEN_PWD_LOCTORS.LOWERCASE_LABLE)).toBeTruthy()
        expect(await page.isChecked(GEN_PWD_LOCTORS.NUMBERS_LABLE)).toBeTruthy()
        expect(await page.isChecked(GEN_PWD_LOCTORS.SYMBOLS_LABLE)).toBeTruthy()

       // Get generated password 
       const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
  
       // Verify the Password match the rule 
       await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)
    });

    test("Allows creating a 'All characters' password with 'length = 36' and rule requires 'Uppercase + Lowercase + Numbers' ", async ({ page }) => {
        // Prepare data: 
        const len = '36';
        let PWD_RULE = new Map([
            ['UPPERCASE', true],
            ['LOWERCASE', true],
            ['NUMBERS', true],
            ['SYMBOLS', false]
        ]);
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Click 'Easy to read' radio button
        await page.locator(GEN_PWD_LOCTORS.ALL_CHARACTERS_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Uncheck Symbols
        await page.locator(GEN_PWD_LOCTORS.SYMBOLS_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.SYMBOLS_LABLE)).toBeFalsy();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

       // Get generated password 
       const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
  
       // Verify the Password match the rule 
       await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)
    });

    test("Allows creating a 'All characters' password with 'length = 25' and rule requires 'Uppercase + Lowercase + Symbols' ", async ({ page }) => {
        // Prepare data: 
        const len = '25';
        let PWD_RULE = new Map([
            ['UPPERCASE', true],
            ['LOWERCASE', true],
            ['NUMBERS', false],
            ['SYMBOLS', true]
        ]);
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Click 'Easy to read' radio button
        await page.locator(GEN_PWD_LOCTORS.ALL_CHARACTERS_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Uncheck Symbols
        await page.locator(GEN_PWD_LOCTORS.NUMBERS_LABLE).uncheck();
        expect(await page.isChecked(GEN_PWD_LOCTORS.NUMBERS_LABLE)).toBeFalsy();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

       // Get generated password 
       const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
  
       // Verify the Password match the rule 
       await testFunctions.verifyPasswordMmatchRules(expect, generated_pwd, PWD_RULE)

    });
})

/**
 * Function 4 - Copy password
 * This suite contains tests that allow copying password with two ways.
 */
test.describe("[Function 4: Test Copy password]  @function4", () => {
    test("Allow me copy the password through Copy Icon button sitted in the same line of generated password.", async ({ page }) => {
        const len = '16';
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Write down the generated button
        const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
        console.log("generated_pwd: " + generated_pwd);

        // Click Copy Icon button at the same line of password
        await page.locator(GEN_PWD_LOCTORS.COPY_ICON_BUTTON).click();

        // Close Copied Popup
        await page.locator(GEN_PWD_LOCTORS.COPIED_POPUP_CLOSE_X_BUTTON).click();

        //Verify the text in clipboard is same as the genreated one
        let clipboardText = await page.evaluate("navigator.clipboard.readText()");

        console.log("clipboardText: " + clipboardText);
        expect(clipboardText).toEqual(generated_pwd);
    });

    test("Allow me copy the password through Copy Password button sitted at the bootom of the form", async ({ page }) => {
        const len = '20';
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Write down the generated button
        const generated_pwd = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
        console.log("generated_pwd: " + generated_pwd);

        // Click Copy Icon button at the same line of password
        await page.locator(GEN_PWD_LOCTORS.COPY_PASSWORD_BUTTON).click();

        // Close Copied Popup
        await page.locator(GEN_PWD_LOCTORS.COPIED_POPUP_CLOSE_X_BUTTON).click();

        //Verify the text in clipboard is same as the genreated one
        let clipboardText = await page.evaluate("navigator.clipboard.readText()");

        console.log("clipboardText: " + clipboardText);
        expect(clipboardText).toEqual(generated_pwd);
    });
})

/**
 * Function 5 - Refresh password
 * This suite contains tests that allow refreshing password for differnt types.
 */
test.describe("[Function 5: Test refresh password]  @function5", () => {
    test("Allow refreshing the password for an 'Easy to say' password' password, check the refreshed password still follow the same rule ", async ({ page }) => {
        // Prepare data: 
        const len = '4';
        let PWD_RULE = new Map([
            ['UPPERCASE', true],
            ['LOWERCASE', true],
            ['NUMBERS', false],
            ['SYMBOLS', false]
        ]);
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);
        //await page.pause();

        // Scroll to the password length input element and fill the length, wait for password refreshed
        await testFunctions.fillPasswordLength(page, expect, len)

        // Click 'Easy to say' radio button
        await page.locator(GEN_PWD_LOCTORS.EASY_TO_SAY_LABEL).click();

        // Wait and verify password was refreshed 
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Write down the generated pasword before refresh
        var pwd_before_refresh = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
        console.log("pwd_before_refresh: " + pwd_before_refresh);

        // Click refresh icon button
        await page.locator(GEN_PWD_LOCTORS.RERESH_ICON_BUTTON).click();

        // Wait and verify password was refreshed
        expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

        // Write down the password after refresh
        var pwd_after_refresh = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
        console.log("pwd_after_refresh: " + pwd_after_refresh);

        // Verify the password was changed
        expect(pwd_after_refresh).not.toEqual(pwd_before_refresh);
  
       // Verify the Password match the rule 
       await testFunctions.verifyPasswordMmatchRules(expect, pwd_after_refresh, PWD_RULE)

    });

    test.describe('Test password refresh funciton.', () => {
        test("Allow refreshing the password for an 'Easy to read' password' password. Adjust the rule and check the refreshed password still follow the adjusted rule ", async ({ page }) => {
        // Prepare data: 
        const len = '46';
        let PWD_RULE = new Map([
            ['UPPERCASE', true],
            ['LOWERCASE', true],
            ['NUMBERS', false],
            ['SYMBOLS', true],
            ['AMBIGUOUS_I_1_O_0', false]
        ]);
            // Go to password generator page, wait for the page is settled with inital 12 length password generated
            await testFunctions.goToGeneratePasswordPage(page, expect);
            //await page.pause();

            // Scroll to the password length input element and fill the length, wait for password refreshed
            await testFunctions.fillPasswordLength(page, expect, len)

            // Click 'Easy to read' radio button
            await page.locator(GEN_PWD_LOCTORS.EASY_TO_READ_LABEL).click();

            // Wait and verify password was refreshed 
            expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

            // Uncheck Numbers
            await page.locator(GEN_PWD_LOCTORS.NUMBERS_LABLE).uncheck();
            expect(await page.isChecked(GEN_PWD_LOCTORS.NUMBERS_LABLE)).toBeFalsy();

            // Write down the generated pasword before refresh
            var pwd_before_refresh = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
            console.log("pwd_before_refresh: " + pwd_before_refresh);

            // Click refresh icon button
            await page.locator(GEN_PWD_LOCTORS.RERESH_ICON_BUTTON).click();

            // Wait and verify password was refreshed
            expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

            // Write down the password after refresh
            var pwd_after_refresh = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
            console.log("pwd_after_refresh: " + pwd_after_refresh);

            // Verify the password was changed
            expect(pwd_after_refresh).not.toEqual(pwd_before_refresh);

            // Verify the Password match the rule 
            await testFunctions.verifyPasswordMmatchRules(expect, pwd_after_refresh, PWD_RULE)

        });

    });

    test.describe('Test password refresh funciton.', () => {
        test("Allow refreshing the password for an 'All characters' password. Adjust the rule and check the refreshed password still follow the adjusted rule ", async ({ page }) => {
            // Prepare data: 
            const len = '16';
            let PWD_RULE = new Map([
                ['UPPERCASE', false],
                ['LOWERCASE', true],
                ['NUMBERS', true],
                ['SYMBOLS', true],
            ]);
            // Go to password generator page, wait for the page is settled with inital 12 length password generated
            await testFunctions.goToGeneratePasswordPage(page, expect);
            //await page.pause();

            // Scroll to the password length input element and fill the length, wait for password refreshed
            await testFunctions.fillPasswordLength(page, expect, len)

            // Click 'Easy to read' radio button
            await page.locator(GEN_PWD_LOCTORS.ALL_CHARACTERS_LABEL).click();

            // Wait and verify password was refreshed 
            expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

            // Uncheck Uppercase
            await page.locator(GEN_PWD_LOCTORS.UPPERCASE_LABLE).uncheck();
            expect(await page.isChecked(GEN_PWD_LOCTORS.UPPERCASE_LABLE)).toBeFalsy();

            // Write down the generated pasword before refresh
            var pwd_before_refresh = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
            console.log("pwd_before_refresh: " + pwd_before_refresh);

            // Click refresh icon button
            await page.locator(GEN_PWD_LOCTORS.RERESH_ICON_BUTTON).click();

            // Wait and verify password was refreshed
            expect(await testFunctions.waitForPasswordGenerated(page, len)).toBe(true);

            // Write down the password after refresh
            var pwd_after_refresh = await page.inputValue(GEN_PWD_LOCTORS.PASSWORD_INPUT);
            console.log("pwd_after_refresh: " + pwd_after_refresh);

            // Verify the password was changed
            expect(pwd_after_refresh).not.toEqual(pwd_before_refresh);

            // Verify the Password match the rule 
            await testFunctions.verifyPasswordMmatchRules(expect, pwd_after_refresh, PWD_RULE)
        });
    });
})

/**
 * Function 6 - Test Password range
 * This suite contains tests that to veriyf the maxium length for allowed password.
 */
test.describe('[Function 6: Test password range]', () => {
    test("Not allow password length exceeds 50", async ({ page }) => {
        var len = '51';
        // Go to password generator page, wait for the page is settled with inital 12 length password generated
        await testFunctions.goToGeneratePasswordPage(page, expect);

        // Scroll to the 'Copy Password' button
        await page.locator(GEN_PWD_LOCTORS.COPY_PASSWORD_BUTTON).scrollIntoViewIfNeeded();

        // Fill password length input  
        await page.locator(GEN_PWD_LOCTORS.PWD_LEN_INPUT).fill(len);
        await page.locator(GEN_PWD_LOCTORS.PWD_LEN_INPUT).press('Tab');

        // Verify Password Length was changed to maxium 50
        var pwd_len = await page.inputValue(GEN_PWD_LOCTORS.PWD_LEN_INPUT);
        console.log("pwd_len: " + pwd_len);

        // Check new password length after Tab out. it will be change to 50 if it is greater than 50
        if (parseInt(len) > 50) {
            expect(pwd_len).toEqual('50');
        }
        else {
            expect(pwd_len).toEqual(len);
        }
        // Wait and verify new password was generated with the ajusted password length
        expect(await testFunctions.waitForPasswordGenerated(page, pwd_len)).toBe(true);

    });
})