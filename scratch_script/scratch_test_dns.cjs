const { Resolver } = require("dns");
const resolver = new Resolver();
resolver.setServers(["223.5.5.5", "114.114.114.114"]);

resolver.resolve4("qishui.douyin.com", (err, addresses) => {
  console.log("DNS 223.5.5.5 addresses for qishui.douyin.com:", err ? err.message : addresses);
});

resolver.resolveCname("qishui.douyin.com", (err, addresses) => {
  console.log("CNAME for qishui.douyin.com:", err ? err.message : addresses);
});
