// XMLHttpRequest only works with manifest v2, need to use fetch on v3
// https://developer.chrome.com/docs/extensions/mv3/xhr/

chrome.runtime.onMessage.addListener((request, sender, callback) => {
    fetch(request.url)
        .then(response => console.log(response))
        .then(
            (response) => {
                if (response.status != 200) {
                    console.log('error, status code; ' + response.status);
                    return;
                }
                response.json().then((data) => {
                    console.log(data);
                });
            }
        )
        .catch((err) => {
            console.log('Fetch error: ' + err);
        });
        return true;

    // let xhttp = new XMLHttpRequest();
    // console.log("here");
    // // const url = 'polyratings.com/eval/2073/index.html'
    // xhttp.onload = () => {
    //     callback(xhttp.responseText);
    // };
    // xhttp.onerror = () => {
        // callback("error");
    // };
    // xhttp.open(message.method, message.url, true); // true means do asynch
    // xhttp.send();
    // return true;
});

