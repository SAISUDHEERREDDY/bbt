# Folder Purpose

This folder hold configuration specific scss files. It does not hold assets,
less, or any other kind of file. Files in the configurations folder should be
preprocessed and globally available in other scss files. As such it is
important that they should not generate actual styles themselves. Instead,
files in the folder should export mixins and variables for use elsewhere.

# Conventions

Files in these folders should be prefixed with underscores to indicate they are
global where they are imported.

It is expected there is both a \_client-variables.scss file and a
\_client-vars.scss for any given configuration.
