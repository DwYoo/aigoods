const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
let data = new FormData();
data.append('images', fs.createReadStream('/home/ubuntu/github.com/DwYoo/aigoods/tests/1.png'));
data.append('class', 'cat');
data.append('name', 'berr');

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://api.pets-mas.com/users/clq6hdirj0000kst0fa0kzc9r/train-images',
  headers: { 
    ...data.getHeaders()
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});