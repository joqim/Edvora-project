
from fastapi import FastAPI
from pydantic import BaseModel
import jwt
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import requests

from pymongo import MongoClient

SECERT_KEY = "my_secret_key"
ALGORITHM ="HS256"
ACCESS_TOKEN_EXPIRES_MINUTES = 800

test_user = {
    "username": "bat",
    "password": "bat1",
}

app = FastAPI()

origins = {
    "http://localhost",
    "http://localhost:3000",
    "https://edvora-project.herokuapp.com"
}

app.add_middleware(
   CORSMiddleware,
    allow_origins = origins,
    allow_credentials =True,
    allow_methods = ["*"],
    allow_headers= ["*"],
)


app = FastAPI()
app.mount('/', StaticFiles(directory="./my-app/build/static", html=True), name="static")
# app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

# connect to MongoDB, change the << MONGODB URL >> to reflect your own connection string
client = MongoClient("mongodb+srv://cs631:edvora1998@cluster0.sug2z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
db=client.edvora
user = {
        'name' : 'joqim',
        'favourite_pokemon' : 'bulbasaur'
    }
result=db.users.insert_one(user)

class LoginItem(BaseModel):
    username: str
    password: str
    
    @app.get("/")
    def read_root():
     return {"Hello": "World"}

@app.post("/login")
async def user_login(loginitem:LoginItem):
    data = jsonable_encoder(loginitem)
    if data['username']== test_user['username'] and data['password']== test_user['password']:
        print ("The login values match")
        encoded_jwt = jwt.encode(data, SECERT_KEY, algorithm=ALGORITHM)
        return {'token': encoded_jwt}        
    else:
        return {'message':'login failed'}



class PokeItem(BaseModel):
    pokemon_name: str

    @app.get("/")
    def read_root():
     return {"Hello": "World"}

@app.post("/save_pokemon")
async def user_login(pokemon:PokeItem):
    data = jsonable_encoder(pokemon)
    print (data['pokemon_name'])
    if data['pokemon_name']:
        print ("Pokemon name is given", data['pokemon_name'])

        #convert input name to lowercase
        pokemon_name = data['pokemon_name']
        base_url = 'https://pokeapi.co/api/v2/pokemon'
        pokemon_response = requests.get(f'{base_url}/{pokemon_name}')
        # pokemon_response = requests.get(f'{base_url}/clefairy')
        print(pokemon_response)
        return {'token': "pokemon saved in Database"}        
    else:
        return {'message':'login failed'}

# @app.post("/save_pokemon")
#     print ("inside save pokemon")