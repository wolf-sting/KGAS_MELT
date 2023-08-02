import requests
import json

payloademail = {
    "email": "mahinvikasrajput@gmail.com"
}

payloadalignment = {
    "systems": "logmap-lite-melt-oaei-2021-web-latest.tar.gz",
    "localTestcase1": "mouse.owl",
    "localTestcase2": "human.owl",
    "localreference": "reference.rdf"
}



headers = {
    "Content-Type": "application/json"
}

emailrequest = True
alighmentrequest = False

if(emailrequest):
    email = requests.post('http://localhost:80/api/output', data=json.dumps(payloademail), headers=headers)
    if(email):
        {
            print(email.text)
        }
    else:
        {
            print(email.text),
            print('error')
        }

if(emailrequest):
    alignment = requests.post('http://localhost:80/api/melt', data= json.dumps(payloadalignment),headers=headers)
    if(alignment):
        {
            print(alignment.text)
        }
    else:
        {
            print(alignment.text),
            print('error')
        }