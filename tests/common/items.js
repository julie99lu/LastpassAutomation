// Expected error message
const ERRORMSG = {
    LOGIN_ERROR_FOR_INVALID_PWD: 'Check your master password and try again.',
    LOGIN_ERROR_FOR_INVALID_USER: 'You may have mistyped your email address. Try again.',

    CREATE_ACCOUNT_ERROR_FOR_GENERAL: "Something doesn't look right. Please check that you've entered everything correctly.",
    CREATE_ACCOUNT_ERROR_FOR_EMAIL_IN_USE: "Email already in use.",
    CREATE_ACCOUNT_ERROR_FOR_EMAIL_INVALID: "Please enter a valid email address.",
    CREATE_ACCOUNT_ERROR_FOR_PWD_MISMATCH: "Make sure this matches your master password",
  };

  // Login Credentials
  const LOGIN = {
    USER_NAME: 'Mitacs.Test@gmail.com',
    PASSWORD: 'Mitacs.Test@123'
  };
  
// Define a class for a password item
class PasswordItem {
    constructor(initialData = {}) {
        this.data = {};
        for (let key in initialData) {
            if (initialData.hasOwnProperty(key)) {
                this.data[key] = initialData[key];
            }
        }
    }
    // Can use bleow sample data in your test. 
    // The "Keys" should exacatly follow below example
    // The "Keys" are used to construct the locator and porpulate 'Add Password' Form in addPassword function in common.js
    /*
    const passwordObj = new PasswordItem({
        URL: 'lastpass.com',
        Name: 'Lastpass',
        Group: 'WebsiteAccount',
        Username: username,
        Password: password,
        Notes: 'Lastpass password',
        PasswordReprompt: false,
        Autologin: false,
        DisableAutofill: false
    });
    */
    // Method to set a key-value pair
    set(key, value) {
        this.data[key] = value;
    }

    // Method to get the value by key
    get(key) {
        return this.data[key];
    }
}

// Export common function
module.exports = { 
    ERRORMSG,
    LOGIN,
    PasswordItem 
  }; 
  