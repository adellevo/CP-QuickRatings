chrome.runtime.onMessage.addListener((request, sender, callback) => {
    const init = {
        method: 'GET'
    };
    fetch(request.url, init)
        .then(response => {
            if (response.status != 200) {
                console.log('error, status code ' + response.status);
                return 'error';
            }
            return response.text();
        })
        .then((htmlRes) => {
            // console.log(htmlRes);
            callback(htmlRes);
        })
        .catch((err) => {
            console.log('Fetch error: ' + err);
        });
        return true;

    // return Promise.resolve("Dummy response to keep the console quiet");
});

