# Project Overview:

PurpleProse is a modern, responsive blogging platform built with React, TypeScript, and Redux. It features a clean, purple-themed design that allows users to create, edit, and share their thoughts with the world.
### Key Features

- **User Authentication**: Sign up, log in, and manage your profile
- **Rich Content Creation**: Advanced WYSIWYG editor for writing posts
- **Image Support**: Upload cover images for your posts
- **Interactive UI**: Responsive design that works on all devices
- **Tag System**: Categorize and filter posts with custom tags
- **Post Management**: Create, edit, and delete your posts

# Setup Instructions:
## Blog Backend API

## Prerequisites
- Node.js (>=14) & npm
- PostgreSQL (local or remote)

## Setup
- Clone repository:
   ```sh
   git clone https://github.com/divij2510/PurpleProse.git
   ```
- Initialize npm and install dependencies:
   ```bash
   npm init -y
   npm install 
   npm install --save-dev nodemon
   ```
- Create `.env` in root (no quotes around values, ensure file is named `.env`):
   ```env
   PORT=5000
   DB_HOST=<supabase url>
   DB_PORT=<supabase port>
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASS=<your supabase password>
   JWT_SECRET=<jwt secret>
   GOOGLE_CLIENT_ID=<your cloud console oauth2 clientid>
   GOOGLE_CLIENT_SECRET=<secret>
   ```
- Ensure PostgreSQL/Supabase details are correct: host without protocol, port separate.
- Start server:
   ```bash
   npm run dev
   ```

## Blog Frontend Static Site




### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

- Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

- Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Google Client ID (for Google Sign-In):
     ```
     VITE_GOOGLE_CLIENT_ID=your-google-client-id
     ```

- Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```

- Open your browser and navigate to `http://localhost:8080`

## Building for Production

```sh
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## AI Tools (Copilot + GPT)

### How I Leveraged AI Tools

- **Component Generation**: Used AI to create reusable React components like PostEditor, Navbar, and Footer.
- **Redux Integration**: Implemented state management with AI-generated Redux slices and actions.
- **Styling Assistance**: Utilized AI to create responsive designs with Tailwind CSS.
- **Bug Fixing**: Identified and resolved issues through collaborative debugging with AI.
- **Code Refactoring**: Improved code quality by asking AI to refactor large files into smaller, more maintainable components.

### Challenges and Error Resolution

During development, we encountered several challenges that were resolved through AI collaboration:

1. **TypeScript Interface Conflicts**
   - **Error**: Type conflicts in the Google Sign-In interface declaration.
   - **Resolution**: Fixed by removing redundant interface declarations and ensuring consistent typing.

2. **Authentication Modal Flickering**
   - **Issue**: Sign-in/sign-up modal kept reloading, making it unusable.
   - **Resolution**: Optimized component rendering by preventing unnecessary re-renders and improving state management.

3. **Page Scroll Position**
   - **Problem**: When navigating to a post detail page, the view was automatically scrolled to the bottom.
   - **Solution**: Added `window.scrollTo(0, 0)` in a `useEffect` hook to ensure the page starts at the top when loaded.

4. **Form Validation**
   - **Challenge**: Implementing proper validation for post creation/editing forms.
   - **Resolution**: Used zod schema validation integrated with react-hook-form.

5. **Image Upload Handling**
   - **Issue**: Managing different states of image uploads and previews.
   - **Solution**: Created dedicated state variables and handlers for image selection, validation, and previewing.

### Prompts I used-
 #### BACKEND:
  1. "Give architecture for a Blog publishing platform that allows users to create, read, update, and delete
 blog posts. The platform should support a web interface (React)
 and a backend API (Node.js ) Frontend: Web: React(Redux toolkit for state management, preferred with SCSS); Backend: Node.js (Express); Database: PostgreSQL"
2. "give detailed setup for supabase from account creation and extracting db urls for backend api use"
 
 3. "add a .env and put in following supabase credentials in appropriate var names"
 
 4. "now i just want the setup and install instructions for npm, node/ express whatever you are using and postgres. I do not know if i already have node/ npm or might have an older version of npm, how to setup remote postgres"
 
 5. "now how to get jwt secret and postgres db details in .env. can i use supabase to fullfill all env variables for postgres"
 
 6. "i did all configurations as you said, imported all code added a .env, (which is not named process.env,  should it be?) now what do i do to run it and test for first time"
 
 7. "use the code i gave you as context for the entire app - for google oauth2 env vars"
 
 8. "suggest changes whereve necessary to solve the clientid problem with the oauth and oauth2 and whatever errors i just sent you after npm run dev is run"
 
 9. "still after updating all that in google cloud console , same error.
   help me debug this"
 
 10. "give me the urls and sample request payloads to use in postman to test this backend app. if you do not have entire source code i gave you in memory ask for waht you need"
 
 #### FRONTEND:
 1. "add dynamic colorful changing background in landing page behind the text, add a blur in front of it."
 2. "add a profile page that opens on clicking post card's author component and list all imports used"
 3. "change theme data for global use. i want a dark mode pink and purple theme"
 4. "nothing happens on clicking signup with google oauth2 doesnt show up. when signing up using email and name keyboard typing doesnt work in name and email textbox. add console logging debug print statements in signup and login so i know if data is reaching the dom"
 
 5. "add a debug print console log statement that shows a successful api connection with backend on port 5000"
 
 6. "that did not solve the issue, the text entered in name/email still doesnt appear in the text field in frontend."
 
 7. "I have since changed backend api logic, it now takes multipart formdata as create post with postimage file, changed routes/posts.js, change the create post page to take post image file as input and list changes in all relevant files to be compatible with new api"
 
 8. "pinpoint why after creating a post or opening a post from the posts list it shows post not found return to home page instead of showing the post."
 9. how do i setup oauth and iframe google client from google button click? give detailed steps for integration.
  
 10. "list any extra setup needed after oauth2 setup. use the backend structure and code i gave in initial prompt for any inference."
