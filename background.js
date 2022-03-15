chrome.runtime.onMessage.addListener((request, sender, callback) => {
    const init = {
        method: 'GET',
        headers: {
            'accept': 'application/vnd.github.v3.raw',
        }
    };
    fetch("https://api.github.com/repos/Polyratings/polyratings-data/contents/professor-list.json?ref=data", init)
        .then(response => {
            if (response.status != 200) {
                console.log('error, status code ' + response.status);
                return 'error';
            }
            return response.json();
        })
        .then((response) => {
            const result = response.find(prof => prof.firstName + ' ' + prof.lastName === request.name);
            callback(result);
        })
        .catch((err) => {
            console.log('Fetch error: ' + err);
        });
    return true;

    // return Promise.resolve("Dummy response to keep the console quiet");
});

