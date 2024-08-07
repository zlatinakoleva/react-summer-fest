# React Summer Fest
React Summer Fest is a web application created with React that provides comprehensive information about a specific event, including location, schedule, tickets, participants, merch products, and other important details. The application has two access levels: administrators and registered users. Administrators can add, edit, and delete information about participants and merch products. Registered users can post, edit, and delete comments. Every user can send emails to the organizers through the contact form. Event Info App offers an easy and convenient way to get informed about and interact with the event.

# Access levels
| Access Rights | Public | Logged user | Admin
| ---   | --- | --- | --- |
| Submit Contact Form | &check; | &check; | &check; |
| Add/Edit/Delete Merch Items | &cross; | &cross; | &check; |
| Add/Edit/Delete Singers | &cross; | &cross; | &check; |
| Draw winners | &cross; | &cross; | &check; |
| Add Comments | &cross; | &check; | &cross; |
| Edit/Remove Comments | &cross; | &check; (only own) | &cross; |

### Credentials for test
| Type | Email | Password |
| ---   | --- | --- | 
| Admin | zk_98@abv.bg | 123456 |
| Admin | admin@abv.bg | admin |
| Default User | johnsmith@abv.bg | 123456 |

# Technologies and libraries

| Name | Purpose |
| ---   | --- |
| [Vite](https://vitejs.dev/) | Project configure |
| [React](https://react.dev/) | Build UI |
| [React Router](https://reactrouter.com/en/main) | Routing |
| [Sass](https://sass-lang.com/) | Styles |
| [Formik](https://formik.org/) | Forms Validation |
| [Yup](https://formik.org/docs/guides/validation#validationschema) | Forms  Validation Schema |
| [EmailJS](https://www.emailjs.com/) | Send emails from contact form  |
| [Mui](https://mui.com/) | Tabs component |
| [Swiper](https://swiperjs.com/react#usage) | Slider |
| [Framer Motion](https://www.framer.com/motion/) | Page change transitions |
| [Gogle Maps API](https://www.npmjs.com/package/@react-google-maps/api) | Load Maps |

# How to run the project
1. Checkout in local folder
1. Client setup
    1. Open terminal in **client** folder;
    1. Run `npm install`
    1. Run `npm run dev`
1. Server setup
    1. Open terminal in **server** folder;
    1. Run `node server.js`











