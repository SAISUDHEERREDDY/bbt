#!/usr/bin/env python

'''Generate keys for your Flowplayer Unlimited license.
'''

import optparse, sys

class KeyGenError(Exception):
    '''
    Error class for Flowplayer unlimited license key generation.
    '''
    def __init__(self, arg):
        self.val = arg
    def __str__(self):
        return '%s: abort: %s' % (sys.argv[0], self.val)


def genkey(dom):
    '''Generates Flowplayer unlimited license key for given domain name.'''
    sum1, sum2 = 0, 0

    dom = list(dom)
    dom.reverse()

    for char in dom:
        sum1 += ord(char) * 63864019835
        sum2 += ord(char) * 63034959441

    return '$%s%s' % (str(sum1)[:7], str(sum2)[:8])

def subdomstrip(dom):

    tld = 'ab.ca,ac.ac,ac.at,ac.be,ac.cn,ac.il,ac.in,ac.jp,ac.kr,ac.sg,ac.th,ac.uk,ad.jp,adm.br,adv.br,ah.cn,am.br,arq.br,art.br,arts.ro,asn.au,asso.fr,asso.mc,bc.ca,bio.br,biz.pl,biz.tr,bj.cn,br.com,cn.com,cng.br,cnt.br,co.ac,co.at,co.de,co.gl,co.hk,co.id,co.il,co.in,co.jp,co.kr,co.mg,co.ms,co.nz,co.th,co.uk,co.ve,co.vi,co.za,com.ag,com.ai,com.ar,com.au,com.br,com.cn,com.co,com.cy,com.de,com.do,com.ec,com.es,com.fj,com.fr,com.gl,com.gt,com.hk,com.hr,com.hu,com.kg,com.ki,com.lc,com.mg,com.mm,com.ms,com.mt,com.mu,com.mx,com.my,com.na,com.nf,com.ng,com.ni,com.pa,com.ph,com.pl,com.pt,com.qa,com.ro,com.ru,com.sb,com.sc,com.sg,com.sv,com.tr,com.tw,com.ua,com.uy,com.ve,com.vn,cp.tz,cq.cn,de.com,de.org,ecn.br,ed.jp,edu.au,edu.cn,edu.hk,edu.mm,edu.my,edu.pl,edu.pt,edu.qa,edu.sg,edu.tr,edu.tw,eng.br,ernet.in,esp.br,etc.br,eti.br,eu.com,eu.int,eu.lv,firm.in,firm.ro,fm.br,fot.br,fst.br,g12.br,gb.com,gb.net,gd.cn,gen.in,go.jp,go.kr,go.th,gov.au,gov.az,gov.br,gov.cn,gov.il,gov.in,gov.mm,gov.my,gov.qa,gov.sg,gov.tr,gov.tw,gov.uk,gr.jp,gs.cn,gv.ac,gv.at,gx.cn,gz.cn,he.cn,hi.cn,hk.cn,hl.cn,hu.com,id.au,idv.tw,in.ua,ind.br,ind.in,inf.br,info.pl,info.ro,info.tr,info.ve,iwi.nz,jl.cn,jor.br,js.cn,jus.br,k12.il,k12.tr,kr.com,lel.br,lg.jp,ln.cn,ltd.uk,maori.nz,mb.ca,me.uk,med.br,mi.th,mil.br,mil.uk,mo.cn,mod.uk,muni.il,nb.ca,ne.jp,ne.kr,net.ag,net.ai,net.au,net.br,net.cn,net.do,net.gl,net.hk,net.il,net.in,net.kg,net.ki,net.lc,net.mg,net.mm,net.mu,net.ni,net.nz,net.pl,net.ru,net.sb,net.sc,net.sg,net.th,net.tr,net.tw,net.uk,net.ve,nf.ca,nhs.uk,nm.cn,nm.kr,no.com,nom.br,nom.ni,nom.ro,ns.ca,nt.ca,nt.ro,ntr.br,nx.cn,odo.br,off.ai,on.ca,or.ac,or.at,or.jp,or.kr,or.th,org.ag,org.ai,org.au,org.br,org.cn,org.do,org.es,org.gl,org.hk,org.in,org.kg,org.ki,org.lc,org.mg,org.mm,org.ms,org.nf,org.ni,org.nz,org.pl,org.ro,org.ru,org.sb,org.sc,org.sg,org.tr,org.tw,org.uk,org.ve,pe.ca,plc.uk,police.uk,ppg.br,presse.fr,pro.br,psc.br,psi.br,qc.ca,qc.com,qh.cn,rec.br,rec.ro,res.in,sa.com,sc.cn,sch.uk,se.com,se.net,sh.cn,sk.ca,slg.br,sn.cn,store.ro,tj.cn,tm.fr,tm.mc,tm.ro,tmp.br,tur.br,tv.br,tv.tr,tw.cn,uk.com,uk.net,us.com,uy.com,vet.br,waw.pl,web.ve,www.ro,xj.cn,xz.cn,yk.ca,yn.cn,zj.cn,zlg.br'.split(',');

    dom = dom.lower()
    bits = dom.split('.')
    bitslen = len(bits)

    # 'localhost', 'myintranet' ...
    if bitslen < 2:
        return dom

    try:
        # ip-number
        int(bits[-1])
        return dom
    except ValueError:
        pass

    secondary = '.'.join(bits[-2:])

    if bitslen > 2 and secondary in tld:
        return '.'.join(bits[-3:])
    return secondary


def domkeys(domains=None, domfile=''):
    '''Returns Flowplayer unlimited license keys mapped to given domain names.
    Domain names can be provided as list and/or read from file.'''
    domainkeys = {}

    if domains is None:
        domains = []

    if domfile:
        try:
            domains += open(domfile).read().split()
        except IOError, inst:
            raise KeyGenError(inst)

    if not domains:
        raise KeyGenError('no domains given')

    for dom in domains:
        dom = subdomstrip(dom)
        if dom.startswith('xn--'):
            dom = dom.decode('idna').encode('utf8')

        try:
            dom = dom.decode('ascii')
            domainkeys[dom] = genkey(dom)

        except UnicodeDecodeError:
            try:
                dom = dom.decode('utf8')
                domainkeys[dom] = genkey(dom)

            except UnicodeDecodeError:
                raise KeyGenError('%s: must be utf-8 encoded' % dom)

    return domainkeys


if __name__ == '__main__':
    parser = optparse.OptionParser(usage='python %prog [-f FILE] domain [domain ...]',
                                   description=__doc__)
    parser.set_defaults(domfile='')
    parser.add_option('-f', '--file', dest='domfile',
                      help='read domain names from FILE')
    options, args = parser.parse_args()

    try:
        domainkeys = domkeys(args, options.domfile)
        for dom in domainkeys:
            print '%s\t%s' % (dom, domainkeys[dom])
    except KeyGenError, inst:
        parser.print_usage()
        sys.exit(inst);
