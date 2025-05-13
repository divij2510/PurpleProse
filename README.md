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

