const express = require('express');
const axios = require('axios');
// const serverless = require('serverless-http');

const PORT = 5000;

const app = express();
const router = express.Router();

app.use(express.json()); 
app.use(express.urlencoded({ extended : false }));

app.listen(PORT);


const RNHolidays2024 = [
    {
        "date" : "2024-01-06",
        "name" : "Dia de Reis",
        "type" : "local"
    },
    {
        "date" : "2024-10-03",
        "name" : "Dia dos Mártires de Cunhaú e Uruaçu",
        "type" : "local"
    },
    {
        "date" : "2024-11-21",
        "name" : "Dia de Nossa Senhora de Apresentação",
        "type" : "local"
    }
];

async function getYearHolidays(year) {
    console.log("what");
    const URL = `https://brasilapi.com.br/api/feriados/v1/${year}`;
    const response = await axios.get(URL);

    response.data.push(RNHolidays2024);

    return response.data;
}

function getMonthInfo(month, year, holidays) {
    let date = new Date(year, month, 1);
    let qtdDiasUteis = 0;
    let holidaysOfMonth = [];
    let diasUteis = [];
    
    for (let i = 0; i < holidays.length; i++) {
        let splitStr = holidays[i].date.split('-');
        let holidayMonth = parseInt(splitStr[1]);

        if (holidayMonth == month + 1) {
            holidaysOfMonth.push(parseInt(splitStr[2]));
        }
    }

    while (date.getMonth() === month) {
        let today = date.getDate();
        if (date.getDay() != 0 && date.getDay() != 6 && !(holidaysOfMonth.includes(today))) {
            diasUteis.push(today);
            qtdDiasUteis++;
        }
        date.setDate(today + 1);
    }

    return [
        {
            qtdDiasUteis: qtdDiasUteis,
            diasUteis: diasUteis,
            diasFeriados: holidaysOfMonth,
        }
    ];
}

router.get('/', (req, res) => {
    res.status(200).send("API is running. You can use 'URL/{year}' to find the working days data from the specified year, or 'URL/{year}/{month}' to find the data from a specific year's month.");
})

router.get('/v1/:year/:month', async (req, res) => {
    const year = req.params.year;
    const month = req.params.month - 1;

    if (month > 11 || month < 0 || year < 2000 || year > 2100)
        return res.status(400).json({
            error: "Data is invalid.",
        })

    let holidays = getYearHolidays(year);
    console.log("what2");
    let data = getMonthInfo(month, year, holidays);

    res.status(200).json({
        monthData: data
    });    
})

router.get('/v1/:year', async (req, res) => {
    const year = req.params.year;

    if (year < 2000 || year > 2100) 
        return res.status(400).json({
            error: "Data is invalid."
        });
  
    let holidays = getYearHolidays(year);
    console.log("what3");

    let data = {};
    let totalDiasUteis = 0;
    let objResponse;

    for (let i = 0; i < 12; i++) {
        objResponse = getMonthInfo(i, year, holidays);
        totalDiasUteis += objResponse.qtdDiasUteis;
        data[i] = objResponse;
    }

    res.status(200).json({
        diasUteisTotal: totalDiasUteis,
        monthsData: data,
    });       
})

app.use('/', router);
// module.exports.handler = serverless(app);