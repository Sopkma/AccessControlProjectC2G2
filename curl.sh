#Start ARG
curl -X POST localhost:8001/login -H "Sludge:EVIL" -H "Content-Type:application/json" -d '{ "username" : "user", "password": "pass" }'
TOTP=$(node run ./totp_cli/cli.js)

#Get token and put in file
curl -X POST localhost:8001/timey -H "Sludge:EVIL" -H "Content-Type:application/json" -d '{ "totp" : "559533", "username":"user", "password" : "pass" }' >token.txt

##Edit response in token file to be a Authorization header no quotes and no brackets
# Delete the first lline when you have the appropriate headers

#query attacks (must be admin to heal) (Stronge4st attack is shlop, but must be admin to use)
cury localhost:80/query/shlop -H @token.txt
