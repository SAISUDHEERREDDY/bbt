This directory is for javascript files to be included in the build but not imported through ES6 imports. Nothing here should be expected to be on the server raw (as you would expect from the assets folder) and nothing here should be directly imported in the application (as this will cause it to be int he build twice.

This method of getting files in the project should only be used as a last resort.
