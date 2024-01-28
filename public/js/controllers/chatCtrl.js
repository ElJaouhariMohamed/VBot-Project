let chat = function(msg, $http) {
    return $http.post('http://127.0.0.1:5000/chat', { input: msg })
        .then(response => {
            const outputString = response.data.output;
            //console.log('Output:', outputString);
            return outputString;
        })
        .catch(error => {
            console.error(error);
        });
};

app.controller('chatCtrl', function($scope, $cookies, $window, $http) {
    $scope.pageTime = new Date().toUTCString();
    if (!$cookies.getObject('signedIn')) {
        $window.location.href = '#!signin';
    }
    $scope.sendMsg = function() {
        const timeQ = new Date().toUTCString();
        const question = $scope.msg;
        var msgContent = document.getElementById('MessageContent');
        var message = "<div class='row'><div class='col-md-12 guest-message'><p style='color: #ffffff;'>" + question + "</p><p class='time'>" + timeQ + "</p></div></div>";
        message += "<div class='row' id='typingdts'><div class='col-md-12 owner-message'><p style='font-size:2em;' class='typing-dots'><span>.</span><span>.</span><span>.</span></p></div></div><script>while(true){simulateTyping()}</script>";

        msgContent.innerHTML += message;
        scrollDown();
        // Clear the text area
        var msgText = document.getElementById('msg');
        msgText.value = '';

        chat(question, $http)
            .then(response => {
                if (response == undefined) {
                    response = "VBot is asleep for now, try agian later !";
                }
                const res = {
                    'res': response,
                    'timeR': new Date().toUTCString(),
                };
                drawMessage(res);
            })
            .catch(error => {
                console.error(error);
            });
    };

    // Function to handle the response and update the message content
    function drawMessage(res) {
        document.getElementById("typingdts").remove();
        var msgContent = document.getElementById('MessageContent');
        var message = "<div class='row'><div class='col-md-12 owner-message'><p style='color: #000;'>" + res.res + "</p><p class='time2'>" + res.timeR + "</p></div></div>";
        msgContent.innerHTML += message;
        scrollDown();
    }

    // Function to automatically scroll down
    function scrollDown() {
        var elem = document.getElementById('MessageContent');
        elem.scrollTop = elem.scrollHeight;
    }
});