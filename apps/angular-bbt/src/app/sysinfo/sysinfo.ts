export interface Sysinfo {
  version: string;
  hostname: string;
  serial_number: string;
  customer: string;
  phone: string;
  email: string;
  groups: string[];
  updates: {
    file: string;
    installed: string;
  }[];
  ethernet: {
    interface: string;
    ipaddr: string;
    cidr: string;
    mask: string;
    macaddr: string;
    status: string;
    gwaddr?: string;
  }[];
  gateway: {
    ipaddr: string;
    address_str: string;
    ping: string;
  };
  filesystem: {
    mount: string;
    size: string;
    used: string;
    available: string;
  }[];
}
