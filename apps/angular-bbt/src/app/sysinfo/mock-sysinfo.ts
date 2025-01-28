import { Sysinfo } from './sysinfo';

export const SYSINFODATA: Sysinfo = {
  version: '5.5.4.0',
  hostname: 'hs',
  serial_number: '*Unset*',
  customer: 'Home Depot',
  phone: '855-270-6224',
  email: 'hsgsupport@hughes.com',
  groups: [
    'Group1',
    'Group2',
    'Group21',
    'Group22',
    'Group23',
    'Group24',
    'Group25',
    'Group26',
    'Group27',
    'Group28',
    'Group29',
    'Group12',
    'Group112',
    'Group1112',
    'Group1112',
    'Group11112',
    'Group32',
    'Group42',
    'Group52'
  ],
  updates: [
    {
      file: 'hms-hs36xx-update-5.3.6-20171101.111546.tgz',
      installed: '20200812150157'
    },
    {
      file: 'hms2-hs36xx-update-5.3.6-20171101.111546.tgz',
      installed: '20200812150158'
    }
  ],
  ethernet: [
    {
      interface: 'eth0',
      ipaddr: '10.131.123.143',
      cidr: '24',
      mask: '255.255.255.0',
      macaddr: '08:60:6e:f9:e8:36',
      status: 'rx 356.42 kB/s'
    },
    {
      interface: 'eth1',
      ipaddr: '172.16.1.1',
      cidr: '24',
      mask: '255.255.255.0',
      macaddr: '08:60:6e:fa:80:c8',
      status: 'DOWN'
    }
  ],
  gateway: {
    ipaddr: '10.131.123.1',
    address_str: 'default via 10.131.123.1 dev eth0 onlink',
    // ping: '0.518 ms'
    ping: 'ping FAILED'
  },
  filesystem: [
    {
      mount: '/',
      size: '40G',
      used: '69%',
      available: '12G'
    },
    {
      mount: '/data',
      size: '1.8T',
      used: '2%',
      available: '1.7T'
    },
    {
      mount: '/reserved',
      size: '8.9G',
      used: '1%',
      available: '8.4G'
    }
  ]
};
