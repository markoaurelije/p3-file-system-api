# p3-file-system-API
## Prerequisites
- docker 
- docker compose

## Deployment
- clone a repository
- run `docker-compose up -d`

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