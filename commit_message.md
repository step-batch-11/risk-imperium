hey i want you to write the commit message based on the changes i provide

## format of commit message
it should be in present tense 
don't add labels like feat, refactor, fix etc
follow the appropriate verb forms

## sample message 

[#2] | Introduces user context display and protects routes with session-based authorization | [Adarsh/Karthik]

Renames user to userManager for consistent dependency handling
Protects /todos route using authorization middleware
Adds /username endpoint to fetch current logged-in user details
Updates todo handler to resolve userId from session instead of hardcoded value
Fixes session lookup to correctly validate session using session query
Enhances UI with username display and user icon in header
Fetches and renders username dynamically on page load
Adds fallback handling when no todos exist to prevent rendering issues
Redirects unauthenticated users to login page on unauthorized API response
Updates styles to support improved header layout and spacing