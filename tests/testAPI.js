const axios = require('axios');

function testAPI() {
    axios.get("http://api.pets-mas.com:3000/test")
        .then(response => {
            console.log(response.data);
            return response.data;
        })
        .catch(error => {
            console.log(error); 
            throw error;
        });
    }

    testAPI()