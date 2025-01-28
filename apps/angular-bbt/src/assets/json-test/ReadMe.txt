This folder (and JSON file) were NOT in the original 
Angular app. 

The included JSON file is what is used to populate the VOD 
menu.  When the app loads, it looks for this file.  

The following line was updated to read this file 'locally' 
rather than the http://{root}/video_player/vod/ URL:

Angular File: on-demand-content.services.ts
Line #: 63

Old Line:
obs = this.http.get<VODMenu>(`video_player/vod`);

New Line:
obs = this.http.get<VODMenu>(`assets/json-test/THD-Demo-2021-11_5.json`);

This will probably be updated once we know where on the LG TV (player) 
this JSON file will be stored


