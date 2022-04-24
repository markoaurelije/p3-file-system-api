# p3-file-system-API
## Prerequisites
- docker 
- docker compose

## Deployment
- clone a repository
- run `docker-compose up -d`
- use API specification in `./docs` folder as a reference on how to use API

## Overview
Creating a large-scale browser-based file system, functionally similar to Dropbox’s web interface, or to a folder browsing structure you might find on a Windows or macOS device.  
A user should be able to:  
- Create folders and subfolders
- Create new files in the folders
- Search files by its exact name within a parent folder or across all files  
List the top 10 files that start with a search string.  
This will be used in the search box to show possible matches when the user is typing.  
Only “start with” logic is required.
- Delete folders and files 

Assuming that a file is simply its name and does not contain any other content.  
API service using a POSTGRESQL database.  

## Status
A MVP with the above requirements is ready, however, here's the list of items I'd like to add if I had more time to dedicate to project.  
TODO:
- update migration files with table indexes
- implement 'scoped view' for the search box functionality which return only name/path fields
- prepare more detailed documentation

WISHLIST:
- GET specific folder content /v1/folders/:id
- GET specific file  /v1/files/:id
- search for folders also
- pagination for both `/folders` and `/files` endpoints
- recursive search 
- search along folder path (not just the folder name)
- implement search only in "root" folder (for search request without `parent` query parameter). Currently, when no parent specified in GET request, it implies search in all folders.