# Bbt

## Quickly Package the application

Run `npm run package` to build and compress the asset files. The compressed package will be dist/bbt.tar.gz

## Development server

Run `ng serve myapp` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

# Projects

There is only one project in the repo at time of writing.

## angular-btt

This project represents the angular conversion of the older static pages

# Creation

This project was generated using [Nx](https://nx.dev).

# Running in WSL2

Additional steps are erquire to run the dev server in WSL2 if you want to hit it on hosts other than localhost and 127.0.0.1, as will be the case when working with smart tvs.

## Expose the port in the WSL system

In WSL, make sure you allow the port through your WSL firewall, if you’re using one. Using a WSL firewall might be redundant, but you might be using one. I usually use ufw in my linux machines, so run I’d run `ufw allow 4200` in WSL.

## Setup Windows port forwarding

1. Open a Powershell with admin right and forward your port from the public IP port to the WSL port using `netsh interface portproxy add v4tov4 listenport=4200 listenaddress=0.0.0.0 connectport=4200 connectaddress=127.0.0.1` in a Powershell with admin rights. After this point you should be able to hit the server with you machines IP from a borwser inside on the same machine but not an external machine. A more agressive listen address could be used than 0.0.0.0, particular if dhcp reservations or fixed ips are aviable for your system, though 0.0.0.0 will accept all connections making it the easiest and most insecure.
2. Allow the port through the Windows firewall explicitly by adding a new Inbound Rule using the Windows Defender Firewall with Advanced Security administrative tool. This is accessible as WF.msc in cmd and Powershell. Select Inbound Rule, and click New rule... in the action menu to the right, and work your way through the menu to allow the port explicitly. Normally, Windows asks if you want to allow applications through the firewall. This doesn’t seem to happen with WSL servers, so we have to manually add a rule.
