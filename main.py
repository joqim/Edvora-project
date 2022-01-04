from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
import os

from fastapi.responses import RedirectResponse, FileResponse, HTMLResponse

app = FastAPI()

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