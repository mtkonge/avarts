# journal

## 04/05

- Theis set up a way to get live coordinates based off of the browsers
  geolocation api, and together with Mikkel pair programmed adding a map of the
  users surroundings using `maplibregl`

## 05/05

- Improved structure of using geolocation by refactoring the map specific code
  into its on class.
- Added creation of route with geolocation and automatically updating the marker
  on the map.
- Mikkel started on backend.

## 06/05

- Concrete implementation of database abstraction
- Refactor geolocation related code into implementors of Geolocator interface.
- Theis created a geolocator interface to provide an alternative implementation
  of geolocation by using the `navigator.geolocation` API instead of the
  `<geolocation>` element. We did this because the `navigator.geolocation` api
  is older and better supported (`<geolocation>` is as of writing only supported
  on chromium based browsers), and does not require a visible "allow
  geolocation" element to work.
- In `app`: Theis consolidated package.json into `deno.jsonc`. This is because
  `package.json` is related to `node.js`, while we would like to go all in on
  Deno, and prevent duplicate information.
- Implemented a Result interface on the backend.

## 07/05

- Theis expanded on Result type to allow `Result<void, void>` to be
  constructable
- Used result types in database interface & implementation
- Implemented get route by id, add route, routes backend api
- Simplified coords handling
- Removed unused `<geolocation>` Geolocator interface implementation
- Add logic for connecting to backend and implemented routes and add route on
  frontend.
- Had issues with Vite in our monorepo setup, so changed our setup temporarily.

## 08/05

- Removed Vite and used our own scripts for building and serving frontend.
- Users and authentication on backend
- Refined 'kravspecifikation.md'

## 11/05

- Implemented simple frontend page for user authentication.
- Drew ascii sprites for loading screens.
- Improved type safety for request and response objects for both frontend and
  backend.

## 12/05

- Loading screen
- Rotate map based on device orientation
- Automatically select dev/prod backend URL, host backend in cloud
- Backend endpoints for adding routes
- Toolbar design

# 13/05

- Fixed wrong geodata
- Created a run recorder for recording runs and running records
- Add frontend support for run endpoints
- Implement maplibregl abstraction
- Implement run route functionality
- Refactor existing code

# 18/05

- Refactored server to abstract business logic from the httproutes

# 19/05

- Created UI for clicking on a route on the map

# 20/05

- Type safety in app.Server interface
- Runs on route

# 21/05

- User from Id route
- Profile page sketch
- Refactor response types
- Leaderboard button when on route popup
- Created a dialog window with a leaderboard data

# 22/05

- Profile page implementation (top runs, recent runs, accurate time and
  placement)
- changed leaderboard to use username instead of id

# 26/05

- Implement leaderboard UI
- Ability to select sport user is competing in
- `document.getElementById` -> `utils.query`
- Tripled checkpoint radius (5m -> 15m) after in-person test of application
- Add ability to name route
- Log out, profile buttons added to toolbar
- Fix database interface returning error instead of null when looking up with
  invalid user id
- Consolidate styling

# 27/05

- Optionally follow camera on user alá google maps navigation
- Leaderboard filter
- When creating route a line will now follow
- Hide routes when creating routes and when on a run
- Added progressive web app manifests
- Added logo
- Renamed beeswax to business_logic
- Close the route popup when starting a run
- Changed routes to theme color

# 01/06

- Delete route
- Route validation
- Alert user of route creation user input errors
