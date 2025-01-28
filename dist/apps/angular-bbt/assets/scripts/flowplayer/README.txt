
Congratulations for picking the Grand version of Flowplayer!
------------------------------------------------------------

This is your unique Flowplayer distribution. You can now generate
your own license keys. They will validate exclusively with the
flowplayer[.min].js and flowplayer.swf files contained here.

You are in charge of the distribution and generation of license
keys specifically for this release. Included are two scripts -
key-gen.js (JavaScript) and key-gen.py (Python) - containing your
personal key generation algorithm.

Additionally there's key-gen.php which autogenerates the key for
the current host. Try it with the auto.php page on your server!


Key generation script usage
---------------------------

key-gen.js requires nodejs - http://nodejs.org. Download nodejs
from http://nodejs.org/download/ and install. Then, fire up a
terminal, and at the command-line prompt enter:

node key-gen.js mydomain.com [otherdomain.org ...]

If you have a file containing domain names:

node key-gen.js -f filewithdomainnames

Alternatively, if you have python installed, run the key-gen.py
script:

python key-gen.py mydomain.com [otherdomain.org ...]
python key-gen.py -f filewithdomainnames

Help is available via the --help|-h option for both scripts.


SWF configuration
-----------------

Always set the locations of flowplayer.swf and flowplayerhls.swf
explicitly. The global configuration is a good place:

flowplayer.conf = {
    swf: "/path/to/flowplayer.swf",
    swfHls: "/path/to/flowplayerhls.swf"
};


Protecting your unlimited license
---------------------------------

Keep the license key generation scripts containing your secret
tokens in a safe place. Do not share or distribute them.

License
-------

You can find the Unlimited License here:
https://flowplayer.org/license/unlimited.html


Upgrading
---------

Bugfix upgrades are free. As the compilation of your unique
Flowplayer distribution cannot be automated, please drop us an
email at support@flowplayer.org containing your Flowplayer login
email address, and we will add a new release to your Flowplayer
account.

When you deploy an upgrade you have to re-generate the license
keys with the scripts pertaining to the upgrade package.


Here are some sample values for different domains:

jquerytools.org	$102629410129717
leipomo.org	$722302071292539
moot.co.uk	$621396961333015
