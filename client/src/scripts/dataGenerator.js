const axios = require('axios')
//! to active go to ../consts/citiesDB and uncomment the module.export
const { cities_arr } = require('../consts/citiesDB')
// console.log(cities_arr);
const url = 'http://localhost:3000/api/my-user/register'
const urlCreateAnswer = 'http://localhost:3000/api/userAnswer/DG-answerAll'

const headers = { "Content-Type": "application/json" }
//all the data for the user
const familyStatus = ['SINGLE', 'DIVORCED', 'MARRIED', 'WIDOW', 'OTHER']
const gender = ['MALE', 'FEMALE', 'OTHER']
const organizationsId = ["5fbbc8e3123dc0f928cf9d9e", "5fbbc93a123dc0f928cf9da0", "5fbbc951123dc0f928cf9da1", "5fbbc98a123dc0f928cf9da3", "5fbbc99d123dc0f928cf9da4", "60aa22a65b8b012a4b546352", "5fd0b7f3cea45041d2718f0c"]
const sectors = ['אחר', 'אזרחים ותיקים', 'חרדית', 'ערבית']
//major loop, creating users
let firstName, lastname;
const createData = async () => {
    for (let i = 0; i < process.argv[2]; i++) {
        try {
            //an api for random names :)
            [firstName, lastname] = (await axios.get("https://namey.muffinlabs.com/name.json?count=1&with_surname=true&frequency=all")).data[0].split(" ")
            const name = `user`
            const user = {
                "userInfo": {
                    "age": Math.floor(Math.random() * (119 - 20) + 20),
                    "city": cities_arr[Math.floor(Math.random() * 1100)],
                    "familyStatus": familyStatus[Math.floor(Math.random() * 5)],
                    "firstName": firstName,
                    "gender": gender[Math.floor(Math.random() * 3)],
                    "lastName": lastname,
                    "organizationId": organizationsId[Math.floor(Math.random() * 7)],
                    "sector": sectors[Math.floor(Math.random() * 4)],
                    "questionnaireId": "606ada841623e2ba3f789e4c"
                }
            }
            let res = await axios.post(url, user);
            if (res.status === 201) {
                let createAnswerRes = await axios.post(urlCreateAnswer, { userQuestionnaireId: "606ada841623e2ba3f789e4c", userId: res.data._id });
            }
        } catch (error) {
            console.log(error);
            console.log(error.response.data);
        }

    }
}
createData();

//how to use:
//1.in citiesDB,comment the reguler export default and uncomment the module.export
//2.in userAnswer.controller, uncomment /DG-answerAll (make sure to comment when done using !!!)
//3.