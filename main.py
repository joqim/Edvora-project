from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
import os

from fastapi.responses import RedirectResponse, FileResponse, HTMLResponse
from pymongo import MongoClient
import jwt
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
import requests
from passlib.context import CryptContext

import json

SECERT_KEY = "my_secret_key"
ALGORITHM ="HS256"
ACCESS_TOKEN_EXPIRES_MINUTES = 800

origins = {
    "http://localhost",
    "http://localhost:3000",
    "https://edvora-project.herokuapp.com",
    "https://edvora-project.herokuapp.com/"
}

app = FastAPI()
app.add_middleware(
   CORSMiddleware,
    allow_origins = origins,
    allow_credentials =True,
    allow_methods = ["*"],
    allow_headers= ["*"],
)

folder = 'my-app/build/'

app.mount("/static/", StaticFiles(directory="my-app/build/static"), name="static")

@app.get("/", response_class=FileResponse)
def read_index(request: Request):
    path = 'my-app/build/index.html' 
    return FileResponse(path)

@app.get("/{catchall:path}", response_class=FileResponse)
def read_index(request: Request):
    # check first if requested file exists
    path = request.path_params["catchall"]
    file = folder+path

    print('look for: ', path, file)
    if os.path.exists(file):
        return FileResponse(file)

    # otherwise return index files
    index = 'my-app/build/index.html' 
    return FileResponse(index)

#put in env, mongoURI string
client = MongoClient("mongodb+srv://cs631:edvora1998@cluster0.sug2z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
db = client.edvora
# user = {
#         'name' : 'joqim',
#         'favourite_pokemon' : 'bulbasaur'
#     }
# result=db.users.insert_one(user)
# print("inserted user into database", result)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def store_user(email, hash_value):
    user = {
        'email': email,
        'password_hash': hash_value
    }
    #change to findone and update
    return db.users.insert_one(user)

def retrieve_user(email):
    user = {
        'email': email
    }
    # return db.users.find_one(user, {'password_hash': 1})
    return db.users.find_one(user)

def update_user(email, pokemon_name):
    user = {
        'email': email
    }
    return db.users.find_one_and_update(user, {'$set': {'pokemon_name': pokemon_name}})

class SignUpItem(BaseModel):
    email: str
    password: str

@app.post("/sign_up")
async def user_sign_up(signupitem:SignUpItem):
    data = jsonable_encoder(signupitem)
    if data['email'] and data['password']:
        print ("Hashing the password")
        #store the hashed value of password in user document
        hashed_value = get_password_hash(data['password'])
        print("hashed value", hashed_value)

        user = store_user(data['email'], hashed_value)
        print("user inserted", user)

        return {'message': 'user inserted'}        
    else:
        return {'message':'login failed'}

class LoginItem(BaseModel):
    email: str
    password: str

@app.post("/login")
async def user_login(loginitem:LoginItem):
    data = jsonable_encoder(loginitem)
    if data['email'] and data['password']:
        user = retrieve_user(data['email'])
        print ("previously_hashed_value", user.get('password_hash'))

        print("checking if hash verification works")
        verified = verify_password(data['password'], user.get('password_hash'))
        print("is it verified", verified)

        encoded_jwt = jwt.encode(data, SECERT_KEY, algorithm=ALGORITHM)
        return {'token': encoded_jwt}        
    else:
        return {'message':'login failed'}


class PokeItem(BaseModel):
    email: str
    pokemon_name: str

    @app.get("/pokemon")
    async def get_pokemon(emailId: str):
        print("email id from parameter", emailId)
        user = retrieve_user(emailId)
        print("user fetched", user)
        return {"message": "World"}

@app.post("/save_pokemon")
async def save_pokemon(pokemon:PokeItem):
    data = jsonable_encoder(pokemon)
    print (data['pokemon_name'])
    if data['email'] and data['pokemon_name']:
        print ("Pokemon name is given", data['pokemon_name'])

        #convert input name to lowercase
        pokemon_name = data['pokemon_name'].lower()
        user = update_user(data['email'], pokemon_name)
        print("updated user document", user)
        # base_url = 'https://pokeapi.co/api/v2/pokemon'
        # pokemon_response = requests.get(f'{base_url}/{pokemon_name}')
        # # pokemon_response = requests.get(f'{base_url}/clefairy')
        # print(pokemon_response)
        return {'token': "pokemon saved in Database"}        
    else:
        return {'message':'login failed'}