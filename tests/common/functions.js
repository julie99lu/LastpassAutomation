/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 */ 
async function goToPortal(page, expect) 
{
  const baseURL = 'https://www.lastpass.com';
  await page.goto(baseURL);
  
  try{
    await page.getByLabel('close', { exact: true }).click({ timeout: 5000 });
  }
  catch(error)
  {
    console.log('No promote ad  window popup, continue the test')
  }

  //Wait for 'Log In' menu show up to make sure the portal is successfully opened
  await expect(page.getByRole('link', { name: 'Log In' })).toBeVisible({timeout: 15000});
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 */ 
async function gotToCreateAccountPage(page, expect) 
{
  // Open portal 
  goToPortal(page, expect);

  // Click 'Sign in' on top menu 
  await page.getByRole('link', { name: 'Log In' }).click();

  // Click 'CREATE AN ACCOUNT' in 'LOG IN' page 
  await page.getByRole('button', { name: 'Create an Account' }).click();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {string} email 
 * @param {string} password 
 * @param {string} reminder
 */ 
async function createAccount(page, expect, email, password, reminder) 
{
  //Open portal 
  gotToCreateAccountPage(page, expect)

  // Fill Required information 
  await page.locator('#email').fill(email);
  await page.waitForTimeout(500);

  await page.locator('#masterpassword').fill(password);
  await page.waitForTimeout(500);

  await page.locator('#confirmmpw').fill(password);
  await page.waitForTimeout(500);

  if(reminder !=null ){
    await page.locator('#passwordreminder').fill(reminder);
    await page.waitForTimeout(500);
  }

  // Sign Up button 
  await page.getByRole('button', { name: "Sign Up - It's Free" }).click({timeout: 10000});
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {string} username 
 * @param {string} password 
 */ 
async function fillLoginInfo(page, expect, username, password) 
{
  // Open portal 
  goToPortal(page, expect);

  // Click 'Sign in' on top menu 
  await page.getByRole('link', { name: 'Log In' }).click();
  
  //Fill Username and Password, then click 'LOG IN' button 
  await page.locator('#root input[name="username"]').fill(username);
  await page.locator('#root input[name="password"]').fill(password);

  //Click 'LOG IN' button 
  await page.getByRole('button', { name: 'Log in' }).click();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {string} username 
 * @param {string} password 
 */ 
async function login(page, expect, username, password) 
{
  // Fill the login in information
  await fillLoginInfo(page, expect, username, password);
  
  // Verify login succeed. Wait and check the username is shown up on the top right user menu.
  await expect(page.frameLocator('#newvault').locator("#userMenuText")).toBeVisible({timeout: 15000}); 
  await expect(page.frameLocator('#newvault').locator('#userMenuText')).toContainText(username.toLowerCase());

}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {string} username 
 * @param {string} password 
 * @param {string} errorMsg
 */ 
async function loginNotAllowed(page, expect, username, password, errorMsg) 
{
  // Fill the login in information
  await fillLoginInfo(page, expect, username, password);
  
  // Check the error message is as expected.
  await expect(page.locator('//span[@data-automation-id="error-message"]')).toBeVisible(); 
  await expect(page.locator('//span[@data-automation-id="error-message"]')).toContainText(errorMsg);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 */ 
async function logout(page, expect) 
{
  //Click user menu on the top right of the page
  await page.frameLocator('#newvault').locator("#userMenuText").click();  

  //Have to wait for 'Log Out' Item toBeInViewport(), or else 'Attend Training' will actually be opened
  //Click 'Log out' from the drop down menu 
  await expect(page.frameLocator('#newvault').locator('#logoutIcon')).toBeInViewport();
  await page.frameLocator('#newvault').locator('#logoutIcon').click();

  //Check user was successfully direcrted to 'Log In' page agin
  await expect(page.getByRole('link', { name: 'Log In' })).toBeVisible({timeout: 10000});

  //Deallocate resources
  await page.close();
}
  
/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {"Folder" | "Name"} sortby
 * @param {"(a-z)" | "(z-a)"} order 
 */ 
async function sort(page, expect, sortby, order) 
{
  const sortbyString =  sortby + " " + order;
  //Slect Sort By key
  await page.frameLocator('#newvault').locator('#orderOption').click({ timeout: 10000 });
  await expect(page.frameLocator('#newvault').locator("//li[text() = '" + sortbyString + "']")).toBeInViewport();
  await page.frameLocator('#newvault').locator("//li[text() = '" + sortbyString + "']").click();
  await expect(page.frameLocator('#newvault').locator('#sortOrderOption')).toHaveText(sortbyString);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {"All Items" | "Passowrds" | "Notes" | "Addresses"  | "Payment Cards" | "Bank Accounts"} item
 * @param {"Folder" | "Name"} sortby
 * @param {"(a-z)" | "(z-a)"} order 
 * @param {string} folder 
 */ 
async function getItemNumberByFolder(page, expect, item, sortby, order, folder) 
{
    //Click Item like from left menu, could be 'Passwords', 'Notes', 'Addresses' etc
    await page.frameLocator('#newvault').locator("//span[text()='" + item + "']").click(); 

    // Do Sort
    await sort(page, expect, sortby, order); 
  
    // Extract item number from Item summary text content based on folder
    const textContent = await page.frameLocator('#newvault').locator("//div[contains(text(), '" + folder + "' )]").locator('visible=true').innerText();
    console.log(item + " folder title : " + textContent);
    const number = parseInt(textContent.match(/\d+/)[0]);
    return number
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {import('./items').PasswordItem} passwordObj
 */ 
async function expandFolder(page, expect, folder, name) 
{

    // Get folder title with item number
    var itemNumberByFolder = await getItemNumberByFolder(page, expect, "Passwords", "Folder", "(a-z)", folder);

    const folderWithItemsNumber = folder + " (" + itemNumberByFolder + ")";
    const folderClass = await page.frameLocator('#newvault').locator("//div[text()='" + folderWithItemsNumber + "']/../..").getAttribute('class');
    console.log("folderClass" + folderClass);

    // expand the folder if it's closed
    if(folderClass.includes('closed'))
    {
      await page.frameLocator('#newvault').locator("//div[text()='" + folderWithItemsNumber + "']").click();
    }
  
    // Verify there is an Item with the name exists so can hover over it.
    await page.frameLocator('#newvault').locator("//p[text()='" + name + "']").hover({ timeout: 10000 });

}

/**
 * @param {import('@playwright/test').Page} page
 */ 
async function expandAdvancedSettingForPassword(page) 
{
    //Expand advanced settings
    const adevancedSettingsButtonClass = await page.frameLocator('#newvault').getByRole('button', { name: "Advanced Settings:" }).getAttribute('aria-expanded');
    if(adevancedSettingsButtonClass == "false")
    {
        await page.frameLocator('#newvault').getByRole('button', { name: "Advanced Settings:" }).click({ timeout: 10000 });
    }
}
/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {import('./items').PasswordItem} passwordObj
 */ 
async function fillPasswordInfoForCreate(page, expect, passwordObj) 
{
    // Porpulate password item information
    // If 'data' exists, consider it as the main object; otherwise, initialize an empty object

    // Expand Advanced Settings in Add or Edit Password popup
    await expandAdvancedSettingForPassword(page) 

    // Based on Key to find the locator, then populate the password information
    // Given the convention utilized by the developers to designate IDs, which involves prefixing the key with 'siteDialog,' we can conveniently populate it as follows
    const dataObj = passwordObj.data || {}; 
    for (const [key, value] of Object.entries(dataObj)) {
        const retrievedValue = (typeof value === 'string' || value instanceof String) ? value : JSON.stringify(value);
        console.log("retrievedValue:" + retrievedValue);        

        if (retrievedValue !== 'null') {
            if(key == 'PasswordReprompt' || key=='Autologin' || key=='DisableAutofill')
            {
                const locator_checkbox = "//input[@id='siteDialog" + key + "']"; 

               if(value == true){
                  await page.frameLocator('#newvault').locator(locator_checkbox).check({ force: true });
                  await page.waitForTimeout(500);
                  expect(page.frameLocator('#newvault').locator(locator_checkbox)).toBeChecked();
               }
               else
               {
                await page.frameLocator('#newvault').locator(locator_checkbox).uncheck({ force: true });
                await page.waitForTimeout(500);
                expect(page.frameLocator('#newvault').locator(locator_checkbox)).not.toBeChecked();
               }      
            }
            else
            {
                const locator_input = '#siteDialog' + key; 
                await page.frameLocator('#newvault').locator(locator_input).fill(retrievedValue);
                await page.waitForTimeout(500);
            }
        }
    }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {import('./items').PasswordItem} passwordObj
 */ 
async function fillPasswordInfoForEdit(page, expect, passwordObj) 
{
    // Porpulate password item information
    // If 'data' exists, consider it as the main object; otherwise, initialize an empty object

    // Expand Advanced Settings in Add or Edit Password popup
    //await expandAdvancedSettingForPassword(page) 
    await page.frameLocator('iframe[title="Last Pass Vault"]').getByRole('button', { name: 'Advance dropdown closed' }).click();


    const dataObj = passwordObj.data || {}; 
    for (const [key, value] of Object.entries(dataObj)) {
        const retrievedValue = (typeof value === 'string' || value instanceof String) ? value : JSON.stringify(value);
        console.log("retrievedValue:" + retrievedValue);        

        if (retrievedValue !== 'null') {
          if(key == 'URL' || key == 'Username' || key == 'Notes')
          {
            await page.frameLocator('iframe[title="Last Pass Vault"]').getByLabel(key).fill(retrievedValue);
            await page.waitForTimeout(500);
          }
          if(key == 'Name')
          {
            await page.frameLocator('iframe[title="Last Pass Vault"]').getByLabel('Name', { exact: true }).fill(retrievedValue);
          }
          if(key == 'Group')
          {
            //await page.frameLocator('iframe[title="Last Pass Vault"]').getByLabel('Folder').fill(retrievedValue);  
            await page.frameLocator('iframe[title="Last Pass Vault"]').locator('input[name="folder"]').fill(retrievedValue);
          }
          if(key == 'Password')
          {
            await page.frameLocator('iframe[title="Last Pass Vault"]').getByLabel('Site password').fill(retrievedValue);
          }
          const PWD_CHECKBOX_NAME= {
            PasswordReprompt: 'passwordProtected',
            Autologin: 'autoLogin',
            DisableAutofill: 'autoFill'
          }

          
          // During editing, the checkbox is actaully just a button, not like dukring Adding, it's a checkbox
          // It's hard to verify if the checkbox is checked or not. because atribtue 'alt' is always "checked checkbox"
          // The only thing changed is src which hold a big data.
          // Need do the check or uncheck verification later based on the 'src'. 
          // If have time need to check the status before do the click
          const locator = "button[name='" + PWD_CHECKBOX_NAME[key] + "']";
          if(key == 'PasswordReprompt' || key=='Autologin' || key=='DisableAutofill')
          {
            if(value == true){
              //await page.frameLocator('#newvault').locator(locator).check({ force: true });
              await page.frameLocator('#newvault').locator(locator).click();
              await page.waitForTimeout(500);
              //expect(page.frameLocator('#newvault').locator(locator)).toBeChecked();
            }
            else{
              await page.frameLocator('#newvault').locator(locator).click();
              await page.waitForTimeout(500);
              //expect(page.frameLocator('#newvault').locator(locator)).not.toBeChecked();
            }
          }
        } 
    }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {import('./items').PasswordItem} passwordObj
 */ 
async function addPassword(page, expect, passwordObj) 
{
    // Get the Folder and Name 
    var folder = passwordObj.get('Group');  
    var name = passwordObj.get('Name'); 
    var username = passwordObj.get('Username');


    // define a variable to store the Password items number for the folder
    var itemNumberByFolder_beforeAdd = 0;
  
    // Check if Item is empty
    const childrenCount = await page.frameLocator('#newvault').locator('locator').locator('*').count();

    // If mot a new uer, click  "+" button
    if(childrenCount == 0){        
      await page.frameLocator('#newvault').locator('#openAddDialog').click({ timeout: 10000 });
      await page.frameLocator('#newvault').locator("//button[@class='addItemCard Password']").click();  
    }
    // If new user, click  "Add items one-by-one" button
    else
    {
      // Get Password items by the folder before Add action
      itemNumberByFolder_beforeAdd = await getItemNumberByFolder(page, expect, "Passwords", "Folder", "(a-z)", folder);
      console.log("Passwords items number before Add: " + itemNumberByFolder_beforeAdd);

      console.log("*****Test fails at below line because the "+" button didn't show up during automation.*****");
      await page.frameLocator('#newvault').locator('#addMenuButtonDefault').click({ timeout: 5000 });
    }
    
    // Fill password information
    await fillPasswordInfoForCreate(page, expect, passwordObj) 

    // Save Password Item information
    await page.frameLocator('#newvault').getByRole('button', { name: "Save" }).click();
    //await page.pause();

    // Get Password items number by the folder After Add action
    const itemNumberByFolder_afterAdd = await getItemNumberByFolder(page, expect, "Passwords", "Folder", "(a-z)", folder);
    console.log("Passwords items number after Add: " + itemNumberByFolder_afterAdd);
 
    // Verify Password items number for the folder was increased by 1
    expect(itemNumberByFolder_afterAdd).toBe(itemNumberByFolder_beforeAdd + 1);

    // Verify Fole with new number and Name were correctly show in the page.
    await expect(page.frameLocator('#newvault').locator("//div[text()='" + folder + " (" + itemNumberByFolder_afterAdd + ")']")).toBeVisible();
    await expect(page.frameLocator('#newvault').locator("//p[text()='" + name + "']")).toBeVisible();
}



/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {string} folder 
 * @param {string} name
 * @param {import('./items').PasswordItem} passwordObj
 */ 
async function editPassword(page, expect, folder, name, passwordObj) 
{ 
    // Expand the folder if it's collapsed based on folder and name before the change
    await expandFolder(page, expect, folder, name) 
    
    // check if Name and Folder are going to be changed
    var newFolder = folder;
    var newName = name;
    if(passwordObj.get('Name') != null)
    {
       newFolder = passwordObj.get('Group');
    }
    if(passwordObj.get('Name') != null)
    {
       newName = passwordObj.get('Name');
    }
  
    // Click the delete button
    await page.frameLocator('#newvault').locator("//p[text()='" + name + "']/../../..//button[@class='itemButton edit']").click();

    // Fill password information
    await fillPasswordInfoForEdit(page, expect, passwordObj)

    // Save update
    await page.frameLocator('#newvault').getByRole('button', { name: "Save" }).click();

    // Verify the change in the panel
    await expect(page.frameLocator('#newvault').locator("//p[text()='" + newName + "']")).toBeVisible();

}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {import('./items').PasswordItem} passwordObj
 */ 
async function deletePassword(page, expect, passwordObj) 
{
    // Get the Folder Name 
    const folder = passwordObj.get('Group'); 
    const name = passwordObj.get('Name');  

    // expand the folder if it's collapsed
    await expandFolder(page, expect, folder, name)

    // Click the delete button
    await page.frameLocator('#newvault').locator("//p[text()='" + name + "']/../../..//button[@class='itemButton delete']").click();

    //Click 'Yes' to confirm delete
    await DeleteConfirmationPopup(page, expect, 'Yes');

    // Verify the item is gone
    await expect(page.frameLocator('#newvault').locator("//p[text()='" + name + "']")).toHaveCount(0);
}


/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 * @param {"No" | "Yes"} action
 */ 
async function DeleteConfirmationPopup(page, expect, action) 
{
    //button[text()='Yes']
    await page.frameLocator('#newvault').locator("//button[text()='Yes']").click({ timeout: 10000 });
}

// Export common function
module.exports = { 
  goToPortal,
  gotToCreateAccountPage, 
  createAccount, 
  login, 
  logout, 
  loginNotAllowed,
  sort,
  addPassword,
  editPassword,
  deletePassword
}; 