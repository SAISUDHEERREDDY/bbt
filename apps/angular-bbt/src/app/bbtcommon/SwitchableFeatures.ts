export type SwitchableFeature =
  | 'Clock' // Switching on enables a clock in the top navigation bar
  | 'Navigables' // Turns on the keystroke based navigation system
  | 'Login' // Toggles the login button on the content landing pages
  | 'HughesRemote' // Adds bindings for the small and large hughes remotes
  | 'LGRemote' // Adds bindings for the large LG Remote
  | 'VolumeMessage' // Toggles sending the volume message
  | 'HomeMessage' // Replaces home button handling with a message event
  | 'MenuMessage' // Replaces menu button handling with a message event
  | 'IdleMessage' // Turns on sending a message when this application
  // determines it is idle
  | 'Live' // Toggles display of the live
  | 'ParkingChannel' // Turns on parking channel behavior
  | 'ManageContent' // Turn manage content on
  | 'Admin'; // Enables the Settings and SysInfo menu items
