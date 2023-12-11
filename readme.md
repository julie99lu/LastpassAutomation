# Lastpass Website Automaton experiment

This package includes some common ulitilies and a few test cases to do the automation testing for a few features on Lastpass website by playwright
Features tested:
Create Account;
Login;
Logout;
Handle Password Item: Add, Edit and Delete;
Generate Password

## Installation

Need to have node.js and playwright installed. 
The tests were generated based on node.js@v20.0.0 and playwright@1.40.1 

## Package files

all stuff saved under tests folder
tests\common: this folder have common functions and common definations can be reused for tests
  -> functions.js
  -> items.js
Have three test files:
tests\
  ->TestCreateAccount.spec.js
  ->TestLoginLogout.spec.js
  ->TestPasswordItem.spec.js
  ->TestGeneratePassword.spec.js

node_moduels folder is not included in the package.

## Usage
To test Password Generator
PS C:\dev\LastpassAutomation> npx playwright test tests/TestGeneratePassword.spec.js

PS C:\dev\LastpassAutomation> npx playwright test 
PS C:\dev\LastpassAutomation> npx playwright test


Tests use a dummy user manually created:
  // Login Credentials
  const LOGIN = {
    USER_NAME: 'Mitacs.Test@gmail.com',
    PASSWORD: 'Mitacs.Test@123'
  };


## Configuration

in playwright.config.js, 
workers: 1
...
browser: 'Google Chrome'

Noticed if run with multiple workers, more failures might due to concurrecy issue.

## Test Report and known issues clarificaiton
-> Cannot create new Account during automation. got error like "Something doesn't look right....", two tests in TestCreateAccount will be fail as expected
-> After added the first Password Item, the Add button "+" does not show up in the page during automation. Cannot test add or edit function with multiple items. 
-> Because missing "+" Add button, each test has to delete the added item. So next test can Add item by clicking "Add items one-by-one" from the welcome page   
-> If you see a lot of failures in TestPsswordItem, probabbly because there're some items for the user, have to manually remove all the items and retry the test. 

## Functions tested for password generator feature
-> Create a password easy to say
-> Create a password easy to read
-> Create a passwor with all characters
-> Password Copy
-> Password refresh
-> Password range limitaion

