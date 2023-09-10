const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const dbConfig = { user: 'system', password: 'tiger', connectString: 'localhost/XE' };
const app = express();

app.use(cors());
app.use(express.json()); // Add this line
app.use(express.static('public'));  // Add this line


console.log('PATH:', process.env.PATH);
console.log('OCI_LIB_DIR:', process.env.OCI_LIB_DIR);

process.env['OCI_LIB_DIR'] = 'C:\\Users\\munee\\Downloads\\instantclient-basic-windows.x64-11.2.0.4.0';
process.env['OCI_INC_DIR'] = 'C:\\Users\\munee\\Downloads\\instantclient-basic-windows.x64-11.2.0.4.0\\sdk\\include';


// Endpoint to get economic data for a specific country
app.get('/economicData/:countryName', async (req, res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(
            `SELECT year, GDP, inflation, unemployment FROM EconomicData WHERE COUNTRYID = :countryName ORDER BY year`,
            [req.params.countryName]
        );

        const formattedData = result.rows.map(row => {
            return {
                year: row[0],
                GDP: row[1],
                inflation: row[2],
                unemployment: row[3]
            }
        });

        res.send(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});

// Endpoint to get investment data for a specific country
app.get('/investmentData/:countryName', async (req, res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(
            `SELECT year, FDI, grossCapitalFormation, portfolioInvestment FROM InvestmentData WHERE COUNTRYID = :countryName ORDER BY year`,
            [req.params.countryName]
        );

        const formattedData = result.rows.map(row => {
            return {
                year: row[0],
                FDI: row[1],
                grossCapitalFormation: row[2],
                portfolioInvestment: row[3]
            }
        });

        res.send(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});


// Endpoint to get sectors and their indicators for a specific country
app.get('/sectors/:countryCode', async (req, res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(
            `SELECT DISTINCT s.SECTORID, s.SECTORNAME, i.INDICATORID, i.INDICATORNAME
             FROM sectors s
             INNER JOIN indicators i ON s.SECTORID = i.SECTORID
             INNER JOIN countrysectorindicators csi ON s.SECTORID = csi.SECTORID AND i.INDICATORID = csi.INDICATORID
             WHERE csi.COUNTRYID = :countryCode`,
            [req.params.countryCode]
        );

        const formattedData = {};
        result.rows.forEach(row => {
            const sectorId = row[0];
            const sectorName = row[1];
            const indicatorId = row[2];
            const indicatorName = row[3];

            if (!formattedData[sectorId]) {
                formattedData[sectorId] = { sectorId, sectorName, indicators: [] };
            }
            formattedData[sectorId].indicators.push({ indicatorId, indicatorName });
        });

        res.send(Object.values(formattedData));
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});


// Endpoint to get specific data for a sector and its indicator for a given country
app.get('/sectorData/:countryId/:sectorId/:indicatorId', async (req, res) => {
    const { countryId, sectorId, indicatorId } = req.params;
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(
            `SELECT YEAR, VALUE
             FROM Countrysectorindicators
             WHERE COUNTRYID = :countryId
             AND SECTORID = :sectorId
             AND INDICATORID = :indicatorId
             ORDER BY YEAR`,
            { countryId, sectorId, indicatorId }
        );

        const formattedData = result.rows.map(row => {
            return {
                year: row[0],
                value: row[1]
            }
        });

        res.send(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});


// Endpoint that receives the form data and logs it
app.post('/api/submit-form', async function (req, res) {
    console.log('Form data received:', req.body);

    const {
        'investment-objective': investmentObjective,
        'risk-tolerance': riskTolerance,
        'preferred-regions': preferredRegion,
        'preferred-sectors': preferredSector,
        'investment-time-horizon': timeHorizon
    } = req.body;

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // Fetch data for each country
        const countryResults = await conn.execute(`
            SELECT c.countryId, c.name, c.continent, e.GDP, e.inflation, e.unemployment, i.FDI, i.grossCapitalFormation, i.portfolioInvestment, AVG(csi.VALUE) AS AVG_VALUE
            FROM Countries c
            JOIN EconomicData e ON c.countryId = e.countryId
            JOIN InvestmentData i ON c.countryId = i.countryId
            JOIN Countrysectorindicators csi ON c.countryId = csi.COUNTRYID
            JOIN sectors s ON csi.SECTORID = s.SECTORID
            WHERE s.SECTORNAME = :preferredSector
            AND c.continent = :preferredRegion
            GROUP BY c.countryId, c.name, c.continent, e.GDP, e.inflation, e.unemployment, i.FDI, i.grossCapitalFormation, i.portfolioInvestment
        `, { preferredSector, preferredRegion });

        console.log('Database query result:', countryResults);

        // Scoring factors
        // Scoring factors
        const scoringFactors = {
            'investment-objective': {
                'long-term-growth': { GDP: 1, unemployment: -1, AVG_VALUE: 2 },
                'regular-income': { FDI: 1, grossCapitalFormation: 1, inflation: -1, AVG_VALUE: 2 },
                'capital-preservation': { GDP: 1, unemployment: -1, inflation: -1, AVG_VALUE: 2 },
                'high-risk-high-return': { portfolioInvestment: 1, inflation: -1, AVG_VALUE: 2 }
            },
            'risk-tolerance': {
                'low': { inflation: -1, unemployment: -1, AVG_VALUE: 2 },
                'medium': { GDP: 1, AVG_VALUE: 2 },
                'high': { portfolioInvestment: 1, AVG_VALUE: 2 }
            },
            'investment-time-horizon': {
                'Short-term': { inflation: 1, AVG_VALUE: 2 },
                'Medium-term': { GDP: 1, AVG_VALUE: 2 },
                'Long-term': { inflation: -1, AVG_VALUE: 2 }
            }
        };


        // Create a score for each country
        countryResults.rows.forEach((row) => {
            const [countryId, name, continent, GDP, inflation, unemployment, FDI, grossCapitalFormation, portfolioInvestment, AVG_VALUE] = row;
            const indicators = { GDP, inflation, unemployment, FDI, grossCapitalFormation, portfolioInvestment, AVG_VALUE };

            let score = 0;
            // Add your scoring logic here
            for (let category of ['investment-objective', 'risk-tolerance', 'investment-time-horizon']) {
                let selected = req.body[category];
                let factors = scoringFactors[category][selected];
                for (let [key, weight] of Object.entries(factors)) {
                    // Ensure that the indicator exists and is a number before adding to score
                    if (indicators[key] !== undefined && !isNaN(indicators[key])) {
                        score += indicators[key] * weight;
                    }
                }
            }

            row.score = score;
            console.log('Country:', name, 'Score:', score);
        });

        // Now sort the countries by score and return the top country
        countryResults.rows.sort((a, b) => b.score - a.score);
        const topCountry = countryResults.rows[0];
        console.log('Top country for investment:', topCountry);
        res.json({ status: 'ok', topCountry: topCountry[1], countryCode: topCountry[0] });  // Add country code

    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});


app.listen(3001, () => console.log('Server running on port 3001'));
