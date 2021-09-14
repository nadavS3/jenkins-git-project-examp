import { AuthConfig } from '@hilma/auth-mongo-nest';
const envfile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development';
require('dotenv').config({ path: envfile })


export default (): AuthConfig => ({
	auth: {
		ttl: { // login time per user role
			"MyUser": 99999999,
			"Admin": 10800,// 3 hrs in secs
			// "SUPERADMIN": 10800 // 3 hrs in secs
			// "SUPERADMIN": 60 // 1 minute test  in secs
		},
		verification_email: {
			welcome_to: "לאוריינות דיגיטלית",
			verifyPath: "/admin/email-verify",
			html: `<div>שמחים שהצטרפת אלינו למערכת אוריינות דיגיטלית -  מערכת שמטרתה לבחון את רמת האוריינות הדיגיטלית של המשתמשים:)</div><div>על מנת שתוכל להיכנס למערכת הניהול שלנו, נבקש לאשר את כתובת המייל שלך </div><a href="${process.env.REACT_APP_DOMAIN}/api{{verifyPath}}?token={{token}}">לחץ כאן לאישור</a>`,
			text: "כדי שתוכל להיכנס למערכת הניהול שלנו, עליך לאשר שזה המייל שלך",
			logoDiv: null,
			logoPath: null
		},
		// ...
		secretOrKey: "k#5t9cf@7mlF$&HS6uI2@bGYfF$kd^n$",
		accessToken_cookie: 'kol'
	},

	app_name: 'digitalOrientation', //english
	app_name_he: 'אוריינות דיגיטלית', //hebrew

	roleAccess: {
		["SIMPLEUSER"]: {
			components: ["QuestionnairePage", "FinishQuestionnairePage", "QuestionsReview", "CoursesPage"],
			defaultHomePage: "QuestionnairePage"
		},
		["ADMIN"]: {
			components: ["usersPage", "statisticsPage"],
			defaultHomePage: "usersPage"
		},
		["SUPERADMIN"]: {
			components: ["categoriesPage", "usersPage", "statisticsPage", "organizationsPage", "addQuestionPage"],
			defaultHomePage: "usersPage"
		}
	},

});
