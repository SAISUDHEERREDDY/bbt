
/*
   Unlimited key generation
*/
function generate_key(domain) {
   if (domain.indexOf("xn--") == 0) {
       bail("punycode input not allowed, only UTF-8");
   }

   var sum1 = 0, sum2 = 0;

   for (var i = domain.length - 1; i >= 0; i--) {
      sum1 += domain.charCodeAt(i) * 63864019835;
      sum2 += domain.charCodeAt(i) * 63034959441;
   }

   return ("$" + sum1).substring(0, 8) + ("" + sum2).substring(0, 8);

}

function getprog() {
    var path = require("path");
    return path.basename(process.argv[1]);
}

function usage() {
   process.stderr.write("Usage: " + process.argv[0] + " " +
      getprog() + " [-f|--file FILE] domain [domain ...]\n");
}


function stripSubdomain(host) {

   var TLD = 'ab.ca,ac.ac,ac.at,ac.be,ac.cn,ac.il,ac.in,ac.jp,ac.kr,ac.sg,ac.th,ac.uk,ad.jp,adm.br,adv.br,ah.cn,am.br,arq.br,art.br,arts.ro,asn.au,asso.fr,asso.mc,bc.ca,bio.br,biz.pl,biz.tr,bj.cn,br.com,cn.com,cng.br,cnt.br,co.ac,co.at,co.de,co.gl,co.hk,co.id,co.il,co.in,co.jp,co.kr,co.mg,co.ms,co.nz,co.th,co.uk,co.ve,co.vi,co.za,com.ag,com.ai,com.ar,com.au,com.br,com.cn,com.co,com.cy,com.de,com.do,com.ec,com.es,com.fj,com.fr,com.gl,com.gt,com.hk,com.hr,com.hu,com.kg,com.ki,com.lc,com.mg,com.mm,com.ms,com.mt,com.mu,com.mx,com.my,com.na,com.nf,com.ng,com.ni,com.pa,com.ph,com.pl,com.pt,com.qa,com.ro,com.ru,com.sb,com.sc,com.sg,com.sv,com.tr,com.tw,com.ua,com.uy,com.ve,com.vn,cp.tz,cq.cn,de.com,de.org,ecn.br,ed.jp,edu.au,edu.cn,edu.hk,edu.mm,edu.my,edu.pl,edu.pt,edu.qa,edu.sg,edu.tr,edu.tw,eng.br,ernet.in,esp.br,etc.br,eti.br,eu.com,eu.int,eu.lv,firm.in,firm.ro,fm.br,fot.br,fst.br,g12.br,gb.com,gb.net,gd.cn,gen.in,go.jp,go.kr,go.th,gov.au,gov.az,gov.br,gov.cn,gov.il,gov.in,gov.mm,gov.my,gov.qa,gov.sg,gov.tr,gov.tw,gov.uk,gr.jp,gs.cn,gv.ac,gv.at,gx.cn,gz.cn,he.cn,hi.cn,hk.cn,hl.cn,hu.com,id.au,idv.tw,in.ua,ind.br,ind.in,inf.br,info.pl,info.ro,info.tr,info.ve,iwi.nz,jl.cn,jor.br,js.cn,jus.br,k12.il,k12.tr,kr.com,lel.br,lg.jp,ln.cn,ltd.uk,maori.nz,mb.ca,me.uk,med.br,mi.th,mil.br,mil.uk,mo.cn,mod.uk,muni.il,nb.ca,ne.jp,ne.kr,net.ag,net.ai,net.au,net.br,net.cn,net.do,net.gl,net.hk,net.il,net.in,net.kg,net.ki,net.lc,net.mg,net.mm,net.mu,net.ni,net.nz,net.pl,net.ru,net.sb,net.sc,net.sg,net.th,net.tr,net.tw,net.uk,net.ve,nf.ca,nhs.uk,nm.cn,nm.kr,no.com,nom.br,nom.ni,nom.ro,ns.ca,nt.ca,nt.ro,ntr.br,nx.cn,odo.br,off.ai,on.ca,or.ac,or.at,or.jp,or.kr,or.th,org.ag,org.ai,org.au,org.br,org.cn,org.do,org.es,org.gl,org.hk,org.in,org.kg,org.ki,org.lc,org.mg,org.mm,org.ms,org.nf,org.ni,org.nz,org.pl,org.ro,org.ru,org.sb,org.sc,org.sg,org.tr,org.tw,org.uk,org.ve,pe.ca,plc.uk,police.uk,ppg.br,presse.fr,pro.br,psc.br,psi.br,qc.ca,qc.com,qh.cn,rec.br,rec.ro,res.in,sa.com,sc.cn,sch.uk,se.com,se.net,sh.cn,sk.ca,slg.br,sn.cn,store.ro,tj.cn,tm.fr,tm.mc,tm.ro,tmp.br,tur.br,tv.br,tv.tr,tw.cn,uk.com,uk.net,us.com,uy.com,vet.br,waw.pl,web.ve,www.ro,xj.cn,xz.cn,yk.ca,yn.cn,zj.cn,zlg.br'.split(',');

   host = host.toLowerCase();

   var bits = host.split("."),
      len = bits.length;

   // 'localhost', 'myintranet' ... or ip number
   if (len < 2 || /^\d+$/.test(bits[len - 1]))
       return host;

   var secondary = bits.slice(-2).join('.');

   if (len >= 3 && TLD.indexOf(secondary) >= 0)
      return bits.slice(-3).join('.');

   return secondary;
}


function help() {
   usage();
   process.stderr.write("\n" +
      "Generate keys for your Flowplayer Unlimited license.\n\n" +
      "Options:\n" +
      "  -h, --help\t\tshow this help message and exit\n" +
      "  -f DOMFILE, --file DOMFILE\n" +
      "\t\t\tread domain names from FILE\n");

   process.exit(1);
}

function bail(err) {
   process.stderr.write(getprog() + ": abort: " + err + "\n\n");
   usage();
   process.exit(1);
}


/* var args = process.argv.slice(2),
    fs = require("fs"),
    expectfile = "";
    domains = [];

args.forEach(function (arg) {
   if (/-h|--help/.test(arg)) {
       help();
   } else if (/-f|--file/.test(arg)) {
       expectfile = arg;
   } else if (expectfile) {
      try {
         fs.readFileSync(arg, "utf8").split(/[\s]+/).forEach(function (dom) {
            if (dom) domains.push(dom);
         });
      } catch (err) {
         bail(err);
      }
      expectfile = "";
   } else {
      domains.push(arg);
   }
});

if (expectfile) bail("option " + expectfile + " requires argument");

if (!domains.length) bail("no domain names given");

domains.forEach(function (domain) {
   domain = stripSubdomain(domain);
   console.info(domain + "\t" + generate_key(domain));
});
*/
