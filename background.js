chrome.runtime.onMessage.addListener((message, sender, callback) => {
    let xhttp = new XMLHttpRequest();
    console.log("here");
    // const url = 'polyratings.com/eval/2073/index.html'
    xhttp.onload = () => {
        callback(xhttp.responseText);
    };
    xhttp.onerror = () => {
        callback("error");
    };
    xhttp.open(message.method, message.url, true); // true means do asynch
    xhttp.send();
    return true;
});

