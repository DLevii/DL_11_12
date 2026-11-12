
const express = require('express');
require('dotenv').config();

const db = require('./db');

const app = express();

app.use(express.json());


// 1. FELADAT
// GET /berletek

app.get('/berletek', async (req, res) => {
    try {
        const sql = `
            SELECT
                berletek.id,
                berletek.megnevezes,
                berletek.ar,
                berletek.ervenyesseg_nap,
                berletek.elerheto,
                tipusok.nev AS tipus_nev
            FROM berletek
            INNER JOIN tipusok
            ON berletek.tipus_id = tipusok.id
            ORDER BY berletek.ar ASC
        `;

        const [eredmeny] = await db.query(sql);

        res.json(eredmeny);

    } catch (hiba) {
        res.status(500).json({
            hiba: hiba.message
        });
    }
});


// 2. FELADAT
// GET /berletek/elerheto

app.get('/berletek/elerheto', async (req, res) => {
    try {
        const sql = `
            SELECT *
            FROM berletek
            WHERE elerheto = 1
            AND ervenyesseg_nap <= 30
        `;

        const [eredmeny] = await db.query(sql);

        res.json(eredmeny);

    } catch (hiba) {
        res.status(500).json({
            hiba: hiba.message
        });
    }
});


// 3. FELADAT
// GET /berletek/kereses/:szoveg

app.get('/berletek/kereses/:szoveg', async (req, res) => {
    try {
        const szoveg = req.params.szoveg;

        const sql = `
            SELECT *
            FROM berletek
            WHERE megnevezes LIKE ?
        `;

        const [eredmeny] = await db.query(sql, ['%' + szoveg + '%']);

        res.json(eredmeny);

    } catch (hiba) {
        res.status(500).json({
            hiba: hiba.message
        });
    }
});


// 4. FELADAT
// GET /tipusok/statisztika

app.get('/tipusok/statisztika', async (req, res) => {
    try {
        const sql = `
            SELECT
                tipusok.nev AS tipus_nev,
                COUNT(berletek.id) AS berletek_szama,
                ROUND(AVG(berletek.ar), 1) AS atlagos_ar
            FROM tipusok
            LEFT JOIN berletek
            ON tipusok.id = berletek.tipus_id
            GROUP BY tipusok.id, tipusok.nev
        `;

        const [eredmeny] = await db.query(sql);

        res.json(eredmeny);

    } catch (hiba) {
        res.status(500).json({
            hiba: hiba.message
        });
    }
});


// 5. FELADAT
// GET /berletek/dragak

app.get('/berletek/dragak', async (req, res) => {
    try {
        const sql = `
            SELECT
                megnevezes,
                ar,
                ervenyesseg_nap
            FROM berletek
            WHERE ar > 20000
            ORDER BY ervenyesseg_nap DESC
        `;

        const [eredmeny] = await db.query(sql);

        res.json(eredmeny);

    } catch (hiba) {
        res.status(500).json({
            hiba: hiba.message
        });
    }
});


// 404 - NEM LÉTEZŐ ÚTVONAL

app.use((req, res) => {
    res.status(404).json({
        hiba: 'Nem található ilyen végpont!'
    });
});


// SZERVER INDÍTÁSA

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('A szerver fut a ' + PORT + ' porton!');
});
