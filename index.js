import express from 'express';
import fetch from 'node-fetch'
import {parseString } from 'xml2js'
const app = express()
// import basicAuth from 'express-basic-auth'

const port = 3000

//for getting user data in json format
app.use(express.json());

//for authentication 
// app.use(basicAuth({
//     users: { 'admin': 'supersecret' }
// }))


var data;
var today;
var tomorrow;
var todayAPI;
var tomorrowAPI;


//Function to convert string into JSON
function convert(st) {

    var arr = st.split("<br/>");
    for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].replace("<b>", "");
    }
    const mp = new Map();

    for (let i = 0; i < arr.length; i++) {
        let tempArr = arr[i].split("</b>");
        if (tempArr.length > 1) {
            mp.set(tempArr[0].replace(":","").trim().replace(" ","_"), tempArr[1].trim())
        }
    }

    const obj = Object.fromEntries(mp);

    return obj;

}

app.get('/', (req, res) => {
    res.send("running ")
})


app.get("/getrss/:cityname", function(req, res) {
    try {
        fetch(`http://www.mypanchang.com/rssfeed.php?cityname=${req.params.cityname}-India`, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/xml'
            }
        }).then(response => {
            return response.text();
        }).then(responseText => {
            var xmlData = responseText;

            parseString(xmlData, function (err, result) {
                if(err){
                    return res.status(404).json(
                        {
                            response_code : 404,
                            message: "Data not found!",
                            result: {}
                        }
                    )
                }
                data = result.rss.channel;
                data = data[0].item;

                today = data[0].description;
                tomorrow = data[1].description;

                var newToday = today[0];
                var newTomorrow = tomorrow[0];

                todayAPI = convert(newToday);
                tomorrowAPI = convert(newTomorrow);

                return res.status(200).json(
                    {
                        response_code : 200,
                        message: "Data has been fetched!",
                        result: {
                            today : todayAPI,
                            tomorrow : tomorrowAPI
                        }
                    }
                )

            })

        }).catch(error => console.log(error))

    } catch (error) {
        res.status(400).send("Internal Error occured");
    }

})

app.listen(port, () => {
    console.log(`RSS app listening on port ${port}`)
})