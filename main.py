from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from fastapi.responses import RedirectResponse, FileResponse, HTMLResponse
from pymongo import MongoClient
import jwt
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
import requests
from passlib.context import CryptContext

#loading env variables
load_dotenv()

SECERT_KEY = "my_secret_key"
ALGORITHM ="HS256"
ACCESS_TOKEN_EXPIRES_MINUTES = 800

HOST_URL = os.getenv('HOST_URL')
origins = {
    HOST_URL
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



MONGO_URI_STRING = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI_STRING)
db = client.edvora

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def store_user(email, hash_value, username):
    user = {
        'email': email,
        'password_hash': hash_value,
        'username': username
    }
    #change to findone and update
    return db.users.find_one_and_update({'email': email}, {'$set': user}, upsert=True)

def retrieve_user(email):
    user = {
        'email': email
    }
    # return db.users.find_one(user, {'password_hash': 1})
    return db.users.find_one(user)

def update_user(email, pokemon_object):
    user = {
        'email': email
    }
    return db.users.find_one_and_update(user, {'$set': 
        {
            'pokemon_name': pokemon_object['name'],
            'pokemon_weight': pokemon_object['weight'],
            'pokemon_height': pokemon_object['height'],
            'pokemon_abilities': pokemon_object['abilities'],
            'pokemon_moves': pokemon_object['moves']
        }
    })

async def prepare_abilities_array(abilities):
    prepared_ability_array = []
    for ability in abilities:
        ability_iterator = ability['ability']
        prepared_ability_array.append(ability_iterator['name'])
    return prepared_ability_array

async def prepare_moves_array(moves):
    prepared_moves_array = []
    for move in moves:
        move_iterator = move['move']
        prepared_moves_array.append(move_iterator['name'])
    return prepared_moves_array

async def retrieve_pokemon_data(name):
    print("inside retrieve_pokemon_data")
    POKE_BASE_URL = os.getenv('POKE_BASE_URL')
    pokemon_response = requests.get(f'{POKE_BASE_URL}/{name}')
    if(pokemon_response):
        parsed_response = pokemon_response.json()
        #print("pokemon API response", parsed_response['name'])

        abilities_array = await prepare_abilities_array(parsed_response['abilities'])
        #print("abilities_array", abilities_array)

        moves_array = await prepare_moves_array(parsed_response['moves'])

        #prepare arrays of types, species, moves and add to this object
        pokemon_object = {
            'name' :  parsed_response['name'],
            'weight': parsed_response['weight'],
            'height': parsed_response['height'],
            'abilities': abilities_array,
            'moves': moves_array
        }
        return pokemon_object
    else:
        return {}

class SignUpItem(BaseModel):
    email: str
    password: str
    username: str

@app.post("/sign_up")
async def user_sign_up(signupitem:SignUpItem):
    data = jsonable_encoder(signupitem)
    print("params passed to signup", data)
    if data['email'] and data['password']:
        print ("Hashing the password")
        #store the hashed value of password in user document
        hashed_value = get_password_hash(data['password'])
        print("hashed value", hashed_value)

        user = store_user(data['email'], hashed_value, data['username'])
        print("user inserted", user)

        return {'message': 'user inserted'}        
    else:
        return {'message':'signup failed'}

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
        print('username', user.get('username'))
        if(verified):
            encoded_jwt = jwt.encode(data, SECERT_KEY, algorithm=ALGORITHM)
            return {'token': encoded_jwt, 'user': user.get('username')}
        else:
            return {'message': 'login failed'}        
    else:
        return {'message':'login failed'}


class PokeItem(BaseModel):
    email: str
    pokemon_name: str

@app.post("/save_pokemon")
async def save_pokemon(pokemon:PokeItem):
    data = jsonable_encoder(pokemon)
    print (data['pokemon_name'])
    if data['email'] and data['pokemon_name']:
        print ("Pokemon name is given", data['pokemon_name'])

        #convert input name to lowercase
        pokemon_name = data['pokemon_name'].lower()
        pokemon_object = await retrieve_pokemon_data(pokemon_name)
        #print("pokemon_object in backend save", pokemon_object)

        if pokemon_object:
            #updating user's favorite pokemon
            user = update_user(data['email'], pokemon_object)
            print("updated user document", user)
            
            # print(pokemon_response)
            return {'message': pokemon_object}
        else:
            return {'message':'Pokemon entered is invalid, try a different name'}       
    else:
        return {'message':'user update failed'}


class PokeItem(BaseModel):
    email: str

@app.post("/get_pokemon")
async def get_pokemon(pokemon:PokeItem):
    print("inside get pokemon")
    data = jsonable_encoder(pokemon)
    email = data['email']
    print("email id from parameter", email)
    user = retrieve_user(email)
    print("user fetched", user.get('pokemon_weight'))
    prepared_response = {
        'pokemon_name': user.get('pokemon_name'),
        'pokemon_weight': user.get('pokemon_weight'),
        'pokemon_height': user.get('pokemon_height'),
        'pokemon_abilities': user.get('pokemon_abilities'),
        'pokemon_moves': user.get('pokemon_moves')
    }
    return {"message": prepared_response}