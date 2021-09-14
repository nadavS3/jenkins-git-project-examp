import requests
url = 'http://localhost:3000/api/my-user/register'
count = 0
# user = {"userInfo":{
# 	"age": 20,
# "city": "אשכולות",
# "familyStatus": "single",
# "firstName": "אלעד" + str(count),
# "gender": "female",
# "lastName": "ראובני",
# "organizationId": "5fbbc93a123dc0f928cf9da0",
# "sector": "אזרחים ותיקים"	}
# 	}
headers = {"Content-Type":"application/json"}
numberOfRequests = int( input("enter number of users you want to create "))
print(type(numberOfRequests))
while numberOfRequests > 0:
    user = {"userInfo":{
	"age": 35,
"city": "אשכולות",
"familyStatus": "single",
"firstName": "אלעד" + str(count),
"gender": "female",
"lastName": "ראובני",
"organizationId": "5fbbc93a123dc0f928cf9da0",
"sector": "אזרחים ותיקים"	}
	}
    count+=1
    post = requests.post(url,json=user,headers=headers)
    numberOfRequests-=1    

print(post.text)