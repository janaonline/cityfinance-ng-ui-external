# Cityfinance

A brief description of what this project does and who it's for

![Logo](https://cityfinance.in/assets/M%20FIGMA/city-finance-ranking.png)

## Tech Stack

**Client:** Angular 11, Bootstrap 5

**Server:** Node 12, NVM

## Install and Setup

1. Git clone the repository:

   ```bash
   git clone https://github.com/janaonline/citifinance-ng-ui.git
   ```

2. Change to the project directory:

   ```bash
   cd citifinance-ng-ui
   ```

3. Switch to the desired branch:

   ```bash
   git checkout <branch-name>
   ```

4. Install project dependencies:

   ```bash
   npm install --force
   ```

5. Forcefully install a specific type definition for lodash:

   ```bash
   npm install --save @types/lodash@4.14.74 --force
   ```

6. Update environment configuration:

   ```bash
   vim citifinance-ng-ui/src/environments/environment.ts
   vim citifinance-ng-ui/src/environments/environment.prod.ts
   ```

7. Build the Angular application:
   ```bash
   node --max_old_space_size=6144 ./node_modules/@angular/cli/bin/ng build --prod
   ```
8. Rename the dist directory to dist1:
   ```bash
   mv dist dist1
   ```

## FAQs

#### 1. How does the re-direction logic works in Questionnaire and 15th FC Grand modules?

Ans: When user logged in, we check for key `postLoginNavigation` in `SessionStorage`. If it exists, then
the user is redirected to that particular page. Otherwise, they are redirected to `/home`.  
 **In case of Questionnaire**, When a User cliccks on the Questionanaire tab, that module internally validates few things (user is logged in or not,user-access, type of user etc). If it is found that user is not logged in, then it set `postLoginNavigation` value to itself.  
 **In case of 15th FC Grant Modules**, the module set the `postLoginNavigation` value to itselgf before redirecting to login page.

### NOTE

This needs to be changed. The implementation done above is not scalable enough to be used in every modules / pages, and not easy to maintain for long term.
