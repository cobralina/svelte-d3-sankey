<script>
  import CryptoJS from "crypto-js";
  import Sankey from './lib/Sankey.svelte'
  import Header from './lib/Header.svelte'
  import Footer from './lib/Footer.svelte'

  let data = window.data;
  let config = window.config;
  let meta = window.meta;
 
// get encrypted data from statamic
  let urlParams = new URLSearchParams(window.location.search);
  //var encodedCiphertext = urlParams.get('configs');
  var encodedCiphertext = "U2FsdGVkX19OJQ%2BeDlhFryPziYY15JGj1eYvRTUxer9D1AmqS16ooujC8Qp6psPbxxyMPQPCis7eRExLFZH53MRr1qxdF24DjUu88oq3DwXr6jAd3rAoQhf%2FB3tOQJikExuIP0TJTvqTBKWbATdT1zIYGkGwNyHlM2DatSgcDvH5pqROvKGGiJ6HjPrgUuhwYTEDKeM2WEV2XbmUSIu2UdapVae7cTo2%2F8NlcZWcLI6MD9xBAHn0bXS5w%2B6x4Q1rqrE7%2F4G2NJ1gh%2BB3S%2BDtPbfK6W0fM%2F5REkng%2F1TpsLzW%2BrenXI1PxQW06SaWBpPfvYVuctsfdDVy9451znki9ukAB0f8fshW4OMXIHpHfbQE6kdojF35WH8XKIO%2BDKpC6Xaqp0S24IlahwW6b7bVMM2ZjdLpnoX3gk69uTGcA4BFDo3P86ZeMN7orMBV%2Fr2Pze8tHD1fhKfTQlsHKs6XK0j3Y6Y4QCiwe26cuj087lVOtUBQWUpw%2FrYSE0rWfBGAWVufGRXgjhZRoSALg1YsR2hWaQMRNxspoV8vzUf2%2FmFS0%2Beu7ZwGdguEv24kIcRynE1tydUvN4bBK02AKR2dpKmuUSBh024rVMBpWwxEq4MLvIi0Os0289NvMytBb1PbUCcROD9AAxoCoRfTpBQLv3IuBSPU1x3jMjWyQxaZHpoKHWhIhfVBKmxxwqS4niJvxc9xEyFfHQwdKyAuXzDsaEAu6Y0rMKGeq2d1QxaxglkZkG5nZyLXcBJ%2FPY0JGY20EATFlDXgiJHXgpO0H7JOBEi1nhnmwtLzD33CzR7gEfDlGbrViyQl1oBHDpR67T0UvPBAsRa%2FIVTrwuCjrafYsDgTg%2FHRuaxSYr9GVfvHq00U07wun6heT9H1STVTxGkkmp9DL%2BGBOUVERnuuAuXsmVNZ5ItMjHqjfhq0Q36XLSuwwhZQbacAdfUw96x0aKMU%2B1Rl6XSkDXqetLjCG%2BN7gYkg%2FNQYNG52RaIM8d%2FFeQAe6vXnp7krYilHb9AheuBWu0UFFx1b5ryIzb7zSAYGp52U0zVpeXs2VC%2F%2B7csu2%2FnW%2B05MAdlaTxT3ekb4MrogY%2BkmZ7I6%2Fq5NjyKpN5ZPP%2FWVccdHZ1FybleFZSDhFTSkfaOh8OkqWwmEJUL%2FszePoUgXUBLCbSRo4JGkP5bwCFOv%2B2qi6k22EfGLkyRLZCcIzsxGOyjnXms74CqTij7GzOEcVE8%2Frya2FZMmrs36%2B0PlUzaDj3gL8ICNaBMZ7O%2BpPySXryVJke%2Fj7iwysfZ8YUaG9b7TiM%2FoPGACweg%2BAu8CGrwNLtf3VeBMQruxAdPafwjJFmRzh82jKJJAA82ZVvIy09Z6KSXDz1AQ6hAt2moz5FV98BVqCKUefAThL7Jev9WlOcaSs5hd24tzLKgsD7eXOkLxMnQBJ9m1B2lhvencRmUIY4jkBh1xRMLsWdvFdy2TGRREfraHyu9PTUcGC46Zn4sieTDYWymgbrqoLWZyR18O8Yk2DozL5I9gClxxWprvPJXlATtPg7G%2FEyEDO9WaQhC80SepHa9RyOTnACLG%2FxRg43wbYjHRmfdlIGC%2FKSSopZC4uc2UgK9JXFzMrLErp2zXRMKjhGV3avIJjsXm4OMzMznqqtFSJYfmcl2yHfsy1jArvyE98IN3Nc9Vmozi%2B2R%2F16R5ZiOZcoKH02OgJnGP%2BbzK%2FhN5j9ksmJ5cV8EQkeSL8gC2DKOXv%2BYW6p4uZcD0tV%2FmuGPV95dAAI2rsrYAYQXIssn24iGkbbXevBha3qQCxY%2B81blcypLWbwhoTaJqRevTU1oSNEaAeQdGZK4Nswisuc8dflk02JsWBTP5nTP8zLNjJQSZGbwjysxfV332R8KYMGG0OyHGJBKfNaiGQPP0kQm2OcjPNJDDhGHiUW6puiI3etnu%2BfORM5EdTJFGVaPiwJ1oF2u%2BAgWmxajvrnGAf9XbUGTWUrnfqMgcTKjNV43sNeC5byFtGVA2XiCS8PuMB1rZGgb%2FXFIq7miwNVszBiXGzlsNPdqx2PLcnm1ZrJtUmaKBDn0bzTtcUJeUYBUxOGEFVUC8bhYp%2FO5SfRMJQORSFN57fG6uSzoxyvysk1aHG689N0jR98lfocknrHVkMsT2g0R4aZl7GNao4lIyiqE2omCkBTWLvfEy5UwjS2yl6sLDnvrk8TCKmf44ccMAJM2Nbbfj62irc%2F459RJQO1vor1mU%2Fdk1Ol42SUVidsLchfpUvzvkwVrvTi2xr6Db2nRl%2BEp%2BmhryKwyMys2L5rzlYFydsD08WVMr5Sqj8IwmGfOtkQniP5Wd7JPnjqnW3WVbchN0trDgNwuKsarnxqBnYVwK%2Bd9sVR6S7cQpCDu8rEg6brNjk%2F0z8x06hTCfMgp9Yi00yygQC1HuZiIrYgnq1FMG5t%2FHse78mFqRCFqDlxY88xWvwnMjKmtj%2Fsh%2FycH7N7H8%2FwGS%2FrWYwpzA4QOoORTvK3w8nw%2BxjGPBvfrAgkhPOg%2Bp2pjOtTbpdb%2BinWM%2F1%2FcpnxLOy5e9EJWlWdLM9F%2FVrYkhQxvWHo4k2%2BgXOkHFV%2F8o";
  console.log(encodedCiphertext)

  if (encodedCiphertext !== null) {

// Decode the ciphertext
  var ciphertext = decodeURIComponent(encodedCiphertext);
  console.log(ciphertext)

  var bytes = CryptoJS.AES.decrypt(ciphertext, 'umlwaehwa82');
  var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  console.log(decryptedData);

  if (decryptedData) {
    data = decryptedData.datas
    config = decryptedData.configs
    meta = decryptedData.metas
  }
}
</script>

<main>
  <div>  
    <Header metaObject= {meta} />
    <Sankey dataObject= {data} configObject= {config} metaObject={meta}/>
    <Footer sourceText= {meta.source} authorText= {meta.author} />
    
  </div>

</main>