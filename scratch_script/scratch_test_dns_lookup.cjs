const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const domains = ["douyin.com", "v.douyin.com", "iesdouyin.com", "music.douyin.com"];

for (const d of domains) {
  dns.lookup(d, (err, address) => {
    console.log(d, "->", err ? err.message : address);
  });
}
