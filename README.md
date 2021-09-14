# digital-orientation

1) Clone our project - git clone https://github.com/hilma-tech/digital-orientation.git

2) Do npm install in client, server and client-admin directories

3) Add in server directory an env file:
    * PORT = 8080 -> for production you need to put a different port 
    * SEND_EMAIL_ADDR -> the mail address - the mail we send mails to our users from -> "digital.orientation.il@gmail.com"
    * SEND_EMAIL_PASS -> not the password to the mail, the password that is givenn from the google acount to enter our mail from another application -> "upse ihmi xymc aoqi"
    the password for this email is "ewqEWQ321#@!"
    * REACT_APP_DOMAIN - the domain of the app -> 
        development : http://localhost (remember when using email verefication you need to also add :
            1) in configuration.ts -> verification_email-> html -> ${process.env.REACT_APP_DOMAIN}:${PORT}
            2) admin.controller.ts -> @Get('/email-verify') -> res.redirect(`${process.env.REACT_APP_DOMAIN}:{the port of the client admin side}`);
        )
        deploy : https://digital-orientation.carmel6000.com 
    * REACT_APP_DOMAIN_ADMIN :
        development :  http:localhost
        deploy : https://digital-orientation-admin.carmel6000.com
4) Install mongo 

5) Use the dump that is in dump/digitalOrientation to clone the database to your computer

6) To run the project:
    * To start the questionnaire side do: 
        cd client, npm start
    * To start the admin side do:
        cd client-admin, npm start
    * To start the server do:
        cd server, npm run start (to watch mode run: npm run start:dev)
7) testing more testing even more testing

8) In https://digital-orientation-admin.carmel6000.com we have a super admin user:

    email: digital.orientation.il@gmail.com
    password: israelDigitalit123!@#
    
    TEST!!
    We also example organization admin for 'מוקד הכשרות דיגיטלים':
    email: eladreuveni@carmel6000.amitnet.org
    password: israelDigitalit123!@#
