function getQuote(id,subid) {
    const url = 'https://mesdczi4fjvqwdb7co4e2hn3sy0robgv.lambda-url.us-east-2.on.aws/'
    fetch(url)
    .then(data=>{return data.json()})
    .then(res=>{console.log(res);
                quote = "\""+res.quote+"\"";
                document.getElementById(id).innerHTML = quote;
                author = "By "+res.author+"";
                if(res.source.length > 0 ) {
                    author += " in '"+res.source+"'";
                }
                document.getElementById(subid).innerHTML = author;
                })
    .catch(error=>console.log(error))
}