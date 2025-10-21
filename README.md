Rental Listings and Management-based Web Application Platform.                       
Url --> "leasenest.onrender.com"

LeaseNest is a simple, user-friendly web app for discovering and booking rental properties.
It lets users browse listings, sign up/login, make and manage bookings, leave and view reviews, and access help/FAQ — all via a responsive, server-rendered interface.

This Application is for -

- Renters / Tenants — people looking for short- or long‑term rentals (students, professionals, travellers) who want to browse listings and book easily.
- Property owners / Landlords / Small hosts — individuals who want to list properties, manage bookings and collect reviews.
- Property managers / Agents — users managing multiple listings who need a simple dashboard for bookings and guest communication.
- Local businesses & brokers — to promote inventory and reach more renters via a lightweight platform.

# Tech Stack used - 

- Frontend --> EJS , HTML5 , CSS3 , Bootstrap 5 , Javascript
- Backend --> Node.js , Express.js, express-session(for development) and Mongo session(for deployment) , Passport.js (authentication), Multer(file uploads), and etc.
- DATABASE --> MongoDB ATLAS 
- Cloud Service --> Cloudinary (file storage)
- Map API Service --> GeoApify
- Razorpay API --> Payment Processing and Refunds
- Google GEMINI API --> LeaseNest AI Assistant 
- Dev tooling --> npm, nodemon, dotenv
- Additional Tools --> Git, Github
- Deployment & Hosting --> Render


# Core features - 

- Responsive server-rendered UI
Clean, EJS-based templates with Bootstrap and media queries ensure consistent experience on desktop and mobile without heavy client bundling.

- Property listings with rich cards
Listing cards show images, key details and actions in a compact, readable layout that adapts to different screen sizes.

- Simple booking workflow
Users can create and manage bookings from listings and the profile page; bookings are presented in a clear, actionable list.

- Profile dashboard (Bookings & Reviews)
Dedicated profile view with toggleable Bookings and Reviews sections for fast access to personal activity and feedback.

- Review system
Guests can leave and view reviews; reviews are shown in styled cards with responsive layout and accessible interactions.

- Fast media handling (Cloudinary)
Image uploads are offloaded to Cloudinary for reliable storage, optimized delivery and smaller page load times.

- Map & location integration (GeoApify)
Listings can display geolocation data to help users find properties visually and filter by area.

- Google Gemini API - Powered AI Chat Assistant  
    - it provides personalized rental suggestions and analyzes user preferences and match with available properties.
     
    - it also provides customer support functionalities and resolves user queries.

- Secure Razorpay Payment Gateway Integration
    - Full Payment Processing with order verification.
    - Automatic Refund Processing --> Instant Cancellation with refund handling.
    - Payment Status Tracking --> Complete visibility into Payment lifecycle.

- Profile Dashboard --> Dual-Panel system for users and hosts with filtering
    - Real time Search and filters (Instant filtering of bookings, reviews, and listings).
    - Multi field Property Search (Comprehensive search across all property details).

- Secure authentication & sessions
Session-based login (express-session / Passport.js patterns) with clear UI state for logged-in vs anonymous users.

- Accessible interactive components
FAQ's and profile toggles include keyboard support, ARIA roles and smooth animations for better UX and accessibility.

- Modular templates & partials
Reusable EJS partials (navbar, footer, profile card) make maintenance and feature additions straightforward.

- Static asset workflow
Static files served from public/ (images, client JS, CSS) for simple deployment and caching strategies.

- Deployed on Render for easy hosting.
